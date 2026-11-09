import { describe, expect, test } from "@jest/globals"

import { WheelStep } from "../../../../../src/combat/spellcasting/aoe/control/WheelStep"
import { SphereShape } from "../../../../../src/combat/spellcasting/aoe/shape/SphereShape"

describe("SphereShape", () => {
  test("measures the radius from the edges of its origin square", () => {
    // 10px per foot: a 50px square at (50, 50), so a 5' radius reaches one square out.
    const square = { x: 50, y: 50, width: 50, height: 50 }
    const inside = [
      { x: 75, y: 75 },
      { x: 25, y: 75 },
      { x: 125, y: 75 },
      { x: 25, y: 25 },
    ]
    const outside = [
      { x: -25, y: 75 },
      { x: 175, y: 75 },
      { x: 75, y: 175 },
    ]
    const shape = new SphereShape(square, 5, 10)
    expect(shape.select([...inside, ...outside])).toEqual(inside)
  })
})

describe("WheelStep", () => {
  test("steps by wheel direction and respects the minimum", () => {
    const stepper = new WheelStep(5, 5)
    expect(stepper.next(10, -100)).toBe(15)
    expect(stepper.next(10, 100)).toBe(5)
    expect(stepper.next(5, 100)).toBe(5)
  })
})
