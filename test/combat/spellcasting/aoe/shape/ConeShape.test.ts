import { describe, expect, test } from "@jest/globals"

import { ConeShape } from "../../../../../src/combat/spellcasting/aoe/shape/ConeShape"

describe("ConeShape", () => {
  const origin = { x: 0, y: 0 }
  const cone = (rotation: number) => new ConeShape(origin, rotation, 150)

  test("rotation 0 faces down the screen", () => {
    expect(cone(0).contains({ x: 0, y: 100 })).toBe(true)
    expect(cone(0).contains({ x: 0, y: -100 })).toBe(false)
  })

  test("rotation 180 faces up the screen", () => {
    expect(cone(180).contains({ x: 0, y: -100 })).toBe(true)
  })

  test("rotation 90 faces left and 270 faces right", () => {
    expect(cone(90).contains({ x: -100, y: 0 })).toBe(true)
    expect(cone(270).contains({ x: 100, y: 0 })).toBe(true)
  })

  test("excludes points beyond the length or outside the spread", () => {
    expect(cone(0).contains({ x: 0, y: 200 })).toBe(false)
    expect(cone(0).contains({ x: 100, y: 10 })).toBe(false)
  })

  test("includes the edge of the spread", () => {
    expect(cone(0).contains({ x: 63, y: 100 })).toBe(true)
    expect(cone(0).contains({ x: 65, y: 100 })).toBe(false)
  })
})
