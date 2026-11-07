import { describe, expect, test } from "@jest/globals"

import { WheelStep } from "../../../../../src/combat/spellcasting/aoe/control/WheelStep"
import { SphereShape } from "../../../../../src/combat/spellcasting/aoe/shape/SphereShape"

describe("SphereShape", () => {
  test("keeps centers within the radius", () => {
    const centers = [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 175, y: 25 },
    ]
    const shape = new SphereShape({ x: 50, y: 50 }, 5, 10)
    expect(shape.select(centers)).toEqual([centers[0], centers[1]])
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
