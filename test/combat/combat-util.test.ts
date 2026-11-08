import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { nextCombatant } from "../../src/combat/combat-util"

jest.mock("../../src/apps/vagabond-tools/usecase/CountdownManager", () => ({
  CountdownManager: {
    activateCombatantAndRollCountdowns: async () => undefined,
  },
}))
jest.mock("../../src/combat/documents/VagabondCombat", () => ({
  VagabondCombatant: class {},
}))

describe("nextCombatant", () => {
  const events: string[] = []
  let openSheets: string[]

  const hostile = (id: string) => {
    const sheet = {
      render: jest.fn(async () => {
        events.push(`open ${id} start`)
        await new Promise((resolve) => setTimeout(resolve, 20))
        openSheets.push(id)
        events.push(`open ${id} done`)
      }),
    }
    return {
      id,
      actor: { sheet },
      combatGroup: "adversaries",
      activations: { value: 1 },
      token: { disposition: -1, object: undefined },
    }
  }

  beforeEach(() => {
    events.length = 0
    openSheets = []
    ;(globalThis as any).CONST = { TOKEN_DISPOSITIONS: { HOSTILE: -1 } }
    ;(globalThis as any).canvas = { animatePan: async () => undefined }
    ;(globalThis as any).foundry = {
      applications: {
        instances: {
          values: () =>
            openSheets.map((id) => ({
              document: { documentName: "Actor" },
              close: async () => {
                events.push(`close ${id}`)
                openSheets = openSheets.filter((open) => open !== id)
              },
            })),
        },
      },
    }
  })

  it("never lets a quick second advance close sheets before the first has opened", async () => {
    const a = hostile("a")
    const b = hostile("b")
    let current: any
    const combat: any = {
      started: true,
      turns: [a, b],
      get combatant() {
        return current
      },
      deactivateCombatant: async () => {
        current = undefined
      },
      nextRound: async () => {
        events.push("next round")
      },
    }
    ;(globalThis as any).game = { user: { isGM: true }, combat }
    combat.turns.forEach((c: any) => {
      c.activations.value = 1
    })

    // Activating a combatant makes it current, as the real combat does.
    const activate = async (c: any) => {
      current = c
    }
    jest
      .spyOn(
        (await import("../../src/apps/vagabond-tools/usecase/CountdownManager"))
          .CountdownManager as any,
        "activateCombatantAndRollCountdowns",
      )
      .mockImplementation(activate as any)

    const first = nextCombatant()
    const second = nextCombatant()
    const third = nextCombatant()
    await Promise.all([first, second, third])

    // The second advance only starts once the first sheet is fully open, and closes it before moving on.
    expect(events.indexOf("close a")).toBeGreaterThan(
      events.indexOf("open a done"),
    )
    // By the time the round advances nothing is left open.
    expect(openSheets).toEqual([])
    expect(events).toContain("next round")
  })
})
