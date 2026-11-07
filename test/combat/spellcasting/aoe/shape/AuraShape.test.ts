import { describe, expect, test } from "@jest/globals"

import { AuraShape } from "../../../../../src/combat/spellcasting/aoe/shape/AuraShape"

// A 1x1 token at the origin on a 100px grid where one square is 5 ft.
const token = { x: 0, y: 0, width: 100, height: 100 }
const perFoot = 100 / 5
const center = (i: number, j: number) => ({ x: i * 100 + 50, y: j * 100 + 50 })

describe("AuraShape.gapToRect", () => {
  test("is zero inside the rectangle", () => {
    expect(AuraShape.gapToRect({ x: 50, y: 50 }, token, true)).toBe(0)
  })

  test("measures diagonals like a king move on square grids", () => {
    expect(AuraShape.gapToRect({ x: 250, y: 250 }, token, true)).toBe(150)
  })

  test("measures diagonals straight on other grids", () => {
    expect(AuraShape.gapToRect({ x: 200, y: 200 }, token, false)).toBeCloseTo(
      141.42,
      1,
    )
  })
})

describe("AuraShape", () => {
  const cells = [center(1, 0), center(2, 0), center(3, 0), center(2, 2)]

  test("a 10 ft aura covers two squares out", () => {
    const shape = new AuraShape(token, 10, perFoot, true)
    expect(shape.select(cells)).toEqual([
      center(1, 0),
      center(2, 0),
      center(2, 2),
    ])
  })

  test("a 5 ft aura covers only the adjacent square", () => {
    expect(new AuraShape(token, 5, perFoot, true).select(cells)).toEqual([
      center(1, 0),
    ])
  })
})
