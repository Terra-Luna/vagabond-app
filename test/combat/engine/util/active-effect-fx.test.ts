import { describe, expect, test } from "@jest/globals"

import { normalizeLightRange, parseLightFx, toLightFxId } from "../../../../src/combat/engine/util/active-effect-fx"

describe("light fx encoding", () => {
  test("round-trips every field", () => {
    const id = toLightFxId(
      "moonlight",
      30,
      ["shapechanger", "fiend"],
      "fire",
      "2d8",
    )
    expect(parseLightFx(id)).toEqual({
      type: "moonlight",
      range: 30,
      burns: ["shapechanger", "fiend"],
      damageType: "fire",
      burnDamage: "2d8",
    })
  })

  test("defaults when optional fields are omitted", () => {
    expect(parseLightFx(toLightFxId("sunlight", 10))).toEqual({
      type: "sunlight",
      range: 10,
      burns: [],
      damageType: "",
      burnDamage: "",
    })
  })

  test("unknown types fall back to basic", () => {
    expect(parseLightFx("light:bogus:5").type).toBe("basic")
  })

  test("values containing delimiters survive the round-trip", () => {
    const id = toLightFxId("basic", 5, ["a:b", "c,d"], "fi:re", "1d6+2")
    expect(parseLightFx(id)).toMatchObject({
      burns: ["a:b", "c,d"],
      damageType: "fi:re",
    })
  })

  test("reads the older colon-delimited encoding", () => {
    expect(parseLightFx("light:moonlight:30:shapechanger:fire:2d8")).toEqual({
      type: "moonlight",
      range: 30,
      burns: ["shapechanger"],
      damageType: "fire",
      burnDamage: "2d8",
    })
  })

  test("malformed payloads fall back to safe defaults", () => {
    expect(parseLightFx("light:{oops")).toEqual({
      type: "basic",
      range: 0,
      burns: [],
      damageType: "",
      burnDamage: "",
    })
  })
})

describe("normalizeLightRange", () => {
  test.each([
    [30, 30],
    ["12", 12],
    [7.9, 7],
    [-5, 0],
    [NaN, 0],
    ["abc", 0],
    [undefined, 0],
  ])("%p -> %p", (input, expected) => {
    expect(normalizeLightRange(input)).toBe(expected)
  })
})
