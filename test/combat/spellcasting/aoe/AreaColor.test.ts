import { describe, expect, test } from "@jest/globals"

import { AreaColor } from "../../../../src/combat/spellcasting/aoe/AreaColor"

describe("AreaColor", () => {
  test("maps damage types to the DamageTypeIcon colors", () => {
    expect(AreaColor.of("fire")).toBe("#de671e")
    expect(AreaColor.of("cold")).toBe("#00d0ff")
    expect(AreaColor.of("shock")).toBe("#ffff56")
    expect(AreaColor.of("slash")).toBe(AreaColor.of("physical"))
  })

  test("falls back to neutral gray with no or an unknown damage type", () => {
    expect(AreaColor.of(undefined)).toBe(AreaColor.DEFAULT)
    expect(AreaColor.of("none")).toBe(AreaColor.DEFAULT)
  })
})
