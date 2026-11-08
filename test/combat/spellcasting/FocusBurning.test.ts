import { describe, expect, test } from "@jest/globals"

import { isOwnedByFocus } from "../../../src/combat/spellcasting/focus-ownership"
import { burningStartDie } from "../../../src/combat/spellcasting/FocusBurning"

describe("isOwnedByFocus", () => {
  test("matches a countdown tagged with the Focus", () => {
    expect(isOwnedByFocus({ focusId: "a" }, "a")).toBe(true)
  })

  test("rejects a countdown tagged with another Focus", () => {
    expect(isOwnedByFocus({ focusId: "b" }, "a")).toBe(false)
  })

  test("treats untagged (older) countdowns as owned", () => {
    expect(isOwnedByFocus({}, "a")).toBe(true)
  })
})

describe("burningStartDie", () => {
  test("returns the largest Burning countdown die", () => {
    expect(
      burningStartDie([
        { effect: "burning", duration: "Cd4" },
        { effect: "burning", duration: "Cd8" },
      ]),
    ).toBe(8)
  })

  test("ignores other effects and non-countdown durations", () => {
    expect(
      burningStartDie([
        { effect: "dazed", duration: "Cd6" },
        { effect: "burning", duration: "1 round" },
      ]),
    ).toBeUndefined()
  })

  test("handles no effects", () => {
    expect(burningStartDie()).toBeUndefined()
  })
})
