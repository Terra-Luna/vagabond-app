import { describe, expect, test } from "@jest/globals"

import { LineShape } from "../../../../../src/combat/spellcasting/aoe/shape/LineShape"

describe("LineShape", () => {
  const row = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ x: i * 10, y: 0 }))
  const origin = { x: 0, y: 0 }

  test("a 30ft line covers six squares, starting at the origin square", () => {
    expect(new LineShape(origin, 0, 30, 5, 2).select(row)).toHaveLength(6)
  })

  test("rotating 90 degrees points it down the column", () => {
    const column = row.map((c) => ({ x: c.y, y: c.x }))
    const line = new LineShape(origin, 90, 30, 5, 2)
    expect(line.select(column)).toHaveLength(6)
    expect(line.select(row)).toHaveLength(1)
  })

  test("width admits neighboring rows", () => {
    const grid = [-10, 0, 10].map((y) => ({ x: 0, y }))
    expect(new LineShape(origin, 0, 30, 5, 2).select(grid)).toHaveLength(1)
    expect(new LineShape(origin, 0, 30, 15, 2).select(grid)).toHaveLength(3)
    expect(new LineShape(origin, 0, 30, 10, 2).select(grid)).toHaveLength(2)
  })
})
