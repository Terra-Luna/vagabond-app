import { beforeEach, describe, expect, it } from "@jest/globals"

import { FamiliarUtil } from "../../../../src/model/actor/util/FamiliarUtil"

const actor = (
  flags: Record<string, unknown>,
  { type = "npc", hp = 3, dead = false } = {},
) => ({
  type,
  system: { health: { value: hp } },
  statuses: new Set(dead ? ["dead"] : []),
  getFlag: (_scope: string, key: string) => flags[key],
})

describe("FamiliarUtil", () => {
  let tokens: any[]

  beforeEach(() => {
    tokens = []
    ;(globalThis as any).canvas = { scene: { tokens: { contents: tokens } } }
  })

  it("only NPCs flagged as a Familiar are Familiars", () => {
    expect(FamiliarUtil.isFamiliar(actor({ isFamiliar: true }) as any)).toBe(true)
    expect(FamiliarUtil.isFamiliar(actor({}) as any)).toBe(false)
    expect(
      FamiliarUtil.isFamiliar(actor({ isFamiliar: true }, { type: "hero" }) as any),
    ).toBe(false)
    expect(FamiliarUtil.isFamiliar(undefined)).toBe(false)
  })

  it("finds the living Familiars following a Hero on the scene", () => {
    const mine = { id: "t1", actor: actor({ isFamiliar: true, followerHeroId: "h1" }) }
    const theirs = { id: "t2", actor: actor({ isFamiliar: true, followerHeroId: "h2" }) }
    const plainFollower = { id: "t3", actor: actor({ followerHeroId: "h1" }) }
    const dead = {
      id: "t4",
      actor: actor({ isFamiliar: true, followerHeroId: "h1" }, { dead: true }),
    }
    tokens.push(mine, theirs, plainFollower, dead)

    expect(FamiliarUtil.tokensOf({ id: "h1" } as any)).toEqual([mine])
  })

  it("finds nothing without a Hero or a scene", () => {
    expect(FamiliarUtil.tokensOf(undefined)).toEqual([])
    ;(globalThis as any).canvas = {}
    expect(FamiliarUtil.tokensOf({ id: "h1" } as any)).toEqual([])
  })
})
