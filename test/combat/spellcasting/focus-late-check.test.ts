import { describe, expect, test } from "@jest/globals"

import { isNewEntrant, owesLateCheck } from "../../../src/combat/spellcasting/focus-late-check"

describe("isNewEntrant", () => {
  test("a token missing from this round's baseline is new", () => {
    expect(isNewEntrant("b", "k", ["a"], "k")).toBe(true)
  })

  test("a token already in the baseline is not new", () => {
    expect(isNewEntrant("a", "k", ["a"], "k")).toBe(false)
  })

  test("with no baseline for this round nobody is new", () => {
    expect(isNewEntrant("b", "old", ["a"], "k")).toBe(false)
    expect(isNewEntrant("b", undefined, undefined, "k")).toBe(false)
  })

  test("no token means no newcomer", () => {
    expect(isNewEntrant(undefined, "k", [], "k")).toBe(false)
  })
})

describe("owesLateCheck", () => {
  const base = { isNewcomer: true, alreadyPaid: true, key: "k" }

  test("owed once a newcomer arrives after upkeep was paid", () => {
    expect(owesLateCheck(base)).toBe(true)
  })

  test("only once per round", () => {
    expect(owesLateCheck({ ...base, lateKey: "k" })).toBe(false)
    expect(owesLateCheck({ ...base, lateKey: "old" })).toBe(true)
  })

  test("not owed when upkeep is unpaid or nobody is new", () => {
    expect(owesLateCheck({ ...base, alreadyPaid: false })).toBe(false)
    expect(owesLateCheck({ ...base, isNewcomer: false })).toBe(false)
  })
})
