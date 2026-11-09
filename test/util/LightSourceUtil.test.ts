import { beforeEach, describe, expect, jest, test } from "@jest/globals"

import { LightSourceUtil } from "../../src/util/LightSourceUtil"

const NOW = 1_000_000_000_000

type Lit = { isLightSource: true; expendable: true; isLit: true; remaining: number; litTS: number }

const torch = (litTS: number): Lit => ({
  isLightSource: true,
  expendable: true,
  isLit: true,
  remaining: 600,
  litTS,
})

const carrier = (data: Lit) => {
  const update = jest.fn(async (changes: any) => {
    Object.assign(data, changes["system.lightSourceData"] ?? {})
    if ("system.lightSourceData.litTS" in changes)
      data.litTS = changes["system.lightSourceData.litTS"]
  })
  const item = { system: { lightSourceData: data }, update, delete: jest.fn() }
  return { actor: { items: [item] }, update }
}

describe("light source burn timers", () => {
  let heartbeat: number
  let paused: boolean
  let scenes: any[]

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(NOW)
    heartbeat = 0
    paused = false
    scenes = []
    ;(LightSourceUtil as any).downtimeHandled = false
    ;(LightSourceUtil as any).lastBeat = 0
    ;(globalThis as any).game = {
      user: { isActiveGM: true },
      get paused() {
        return paused
      },
      actors: { contents: [] as any[] },
      get scenes() {
        return { contents: scenes }
      },
      settings: {
        get: (_sys: string, key: string) =>
          key === "lightHeartbeat" ? heartbeat : true,
        set: async (_sys: string, key: string, value: number) => {
          if (key === "lightHeartbeat") heartbeat = value
        },
      },
    }
  })

  const run = () => (LightSourceUtil as any).expireSpentSources()

  test("time while no GM was online does not burn a lit torch", async () => {
    const data = torch(NOW - 3_600_000)
    const { actor } = carrier(data)
    heartbeat = NOW - 3_000_000
    ;(globalThis as any).game.actors.contents = [actor]
    scenes = [{ active: true, tokens: [{ actor, actorLink: true }] }]

    await run()

    expect(data.litTS).toBe(NOW - 600_000)
    expect(heartbeat).toBe(NOW)
  })

  test("short gaps and a fresh world are left alone", async () => {
    const data = torch(NOW - 60_000)
    const { actor } = carrier(data)
    heartbeat = NOW - 5_000
    ;(globalThis as any).game.actors.contents = [actor]
    scenes = [{ active: true, tokens: [{ actor, actorLink: true }] }]

    await run()

    expect(data.litTS).toBe(NOW - 60_000)
  })

  test("a torch without a token in the active scene is frozen, and resumes when it returns", async () => {
    const data = torch(NOW - 100_000)
    const { actor } = carrier(data)
    ;(globalThis as any).game.actors.contents = [actor]
    scenes = [{ active: false, tokens: [{ actor, actorLink: true }] }]

    await run()

    expect(data.litTS).toBe(0)
    expect(data.remaining).toBe(500)

    scenes = [{ active: true, tokens: [{ actor, actorLink: true }] }]
    await run()

    expect(data.litTS).toBe(NOW)
    expect(data.remaining).toBe(500)
  })

  test("a paused game freezes torches in the active scene", async () => {
    const data = torch(NOW - 100_000)
    const { actor } = carrier(data)
    ;(globalThis as any).game.actors.contents = [actor]
    scenes = [{ active: true, tokens: [{ actor, actorLink: true }] }]
    paused = true

    await run()

    expect(data.litTS).toBe(0)
    expect(data.remaining).toBe(500)
  })
})
