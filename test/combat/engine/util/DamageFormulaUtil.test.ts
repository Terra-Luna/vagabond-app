import { describe, expect, test } from "@jest/globals"

import { DamageFormulaUtil } from "../../../../src/combat/engine/util/DamageFormulaUtil"

describe("DamageFormulaUtil.parse", () => {
  test("reads dice with and without a count", () => {
    expect(DamageFormulaUtil.parse("2d6")).toEqual({
      dice: [{ count: 2, faces: 6 }],
      flat: 0,
    })
    expect(DamageFormulaUtil.parse("d8")).toEqual({
      dice: [{ count: 1, faces: 8 }],
      flat: 0,
    })
  })

  test("reads several terms and flat bonuses, ignoring spaces and case", () => {
    expect(DamageFormulaUtil.parse(" 1D6 + 2d4 - 1 ")).toEqual({
      dice: [
        { count: 1, faces: 6 },
        { count: 2, faces: 4 },
      ],
      flat: -1,
    })
  })

  test("a plain number is flat damage", () => {
    expect(DamageFormulaUtil.parse("3")).toEqual({ dice: [], flat: 3 })
  })

  test("blank and malformed formulas are not damage", () => {
    expect(DamageFormulaUtil.parse("")).toBeUndefined()
    expect(DamageFormulaUtil.parse(undefined)).toBeUndefined()
    expect(DamageFormulaUtil.parse("fire")).toBeUndefined()
    expect(DamageFormulaUtil.parse("1d6+")).toBeUndefined()
    expect(DamageFormulaUtil.parse("1d0")).toBeUndefined()
    expect(DamageFormulaUtil.parse("-1d6")).toBeUndefined()
    expect(DamageFormulaUtil.parse("0")).toBeUndefined()
  })
})
