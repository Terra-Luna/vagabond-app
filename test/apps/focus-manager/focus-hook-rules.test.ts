import { describe, expect, test } from "@jest/globals"

import { changesFocusSpells, endsTurnOrRound, isHostile, isHostileTurn, isMovement, isRoundChange, isTurnOrRoundChange } from "../../../src/apps/focus-manager/focus-hook-rules"
import { sys_id } from "../../../src/util/foundry-util"

describe("focus hook rules", () => {
  test("round and turn changes", () => {
    expect(isRoundChange({ round: 2 })).toBe(true)
    expect(isRoundChange({ turn: 1 })).toBe(false)
    expect(isTurnOrRoundChange({ turn: 1 })).toBe(true)
    expect(isTurnOrRoundChange({ round: 1 } as any)).toBe(true)
    expect(isTurnOrRoundChange({ foo: 1 } as any)).toBe(false)
  })

  test("end of turn or round", () => {
    expect(endsTurnOrRound({ round: 3 } as any)).toBe(true)
    expect(endsTurnOrRound({ turn: null })).toBe(true)
    expect(endsTurnOrRound({ turn: 2 })).toBe(false)
    expect(endsTurnOrRound({})).toBe(false)
  })

  test("hostile detection", () => {
    expect(isHostile({ disposition: -1 })).toBe(true)
    expect(isHostile({ disposition: 1 })).toBe(false)
    expect(isHostile(undefined)).toBe(false)
    expect(isHostileTurn({ token: { disposition: -1 } })).toBe(true)
    expect(isHostileTurn({})).toBe(false)
  })

  test("movement", () => {
    expect(isMovement({ x: 1 })).toBe(true)
    expect(isMovement({ y: 1 })).toBe(true)
    expect(isMovement({ movement: {} })).toBe(true)
    expect(isMovement({ name: "a" })).toBe(false)
  })

  test("focus flag changes", () => {
    expect(
      changesFocusSpells({ flags: { [sys_id]: { focusedSpells: [] } } }),
    ).toBe(true)
    expect(changesFocusSpells({ flags: { [sys_id]: { other: 1 } } })).toBe(
      false,
    )
    expect(changesFocusSpells({})).toBe(false)
  })
})
