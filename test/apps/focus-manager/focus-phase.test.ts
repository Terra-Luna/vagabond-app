import { describe, expect, test } from "@jest/globals"

import { resolveFocusPhase } from "../../../src/apps/focus-manager/focus-phase"

const base = { isDue: true, needsUpkeep: true, roundKey: "c:2" }

describe("resolveFocusPhase", () => {
  test("a Focus that isn't due is done", () => {
    expect(resolveFocusPhase({ ...base, isDue: false })).toBe("done")
  })

  test("owing upkeep starts at upkeep", () => {
    expect(resolveFocusPhase(base)).toBe("upkeep")
  })

  test("a failed check this round needs a rescue", () => {
    expect(resolveFocusPhase({ ...base, failedKey: "c:2" })).toBe("rescue")
  })

  test("a failed check from an earlier round is ignored", () => {
    expect(resolveFocusPhase({ ...base, failedKey: "c:1" })).toBe("upkeep")
  })

  test("paying upkeep moves on to damage", () => {
    expect(resolveFocusPhase({ ...base, paidKey: "c:2" })).toBe("damage")
  })

  test("a Focus that owes no upkeep goes straight to damage", () => {
    expect(resolveFocusPhase({ ...base, needsUpkeep: false })).toBe("damage")
  })

  test("paid beats a stale failure", () => {
    expect(
      resolveFocusPhase({ ...base, paidKey: "c:2", failedKey: "c:2" }),
    ).toBe("damage")
  })
})
