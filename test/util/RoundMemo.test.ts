import { describe, expect, it } from "@jest/globals"

import { RoundMemo } from "../../src/util/RoundMemo"

describe("RoundMemo", () => {
  it("remembers keys within a round", () => {
    const memo = new RoundMemo()
    expect(memo.has("r1", "a")).toBe(false)
    memo.add("r1", "a")
    expect(memo.has("r1", "a")).toBe(true)
    expect(memo.has("r1", "b")).toBe(false)
  })

  it("forgets everything when the round changes", () => {
    const memo = new RoundMemo()
    memo.add("r1", "a")
    expect(memo.has("r2", "a")).toBe(false)
    expect(memo.has("r1", "a")).toBe(false)
  })
})
