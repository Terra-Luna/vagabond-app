import { describe, expect, test } from "@jest/globals"

import { applyCastDefaults } from "../../../src/combat/spellcasting/cast-defaults"
import { Glyph, Imbue, Line, type SpellSnapshot, Sphere } from "../../../src/combat/spellcasting/SpellDelivery"

const spell: SpellSnapshot = {
  uuid: "x",
  name: "X",
  baseManaCost: 0,
  damageType: "fire",
  ignoreEffectCost: false,
  appliedEffects: [],
  img: "",
  description: "",
  upcastableEffect: false,
  upcastableEffectDieRoll: false,
}
const mods = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }

describe("applyCastDefaults", () => {
  test("starts with no damage dice, cast for effect, and Focused", () => {
    const sphere = new Sphere(spell, mods)
    sphere.setSize(sphere.baseSize)

    applyCastDefaults(sphere)

    expect(sphere.damageDice).toBe(0)
    expect(sphere.applyEffect).toBe(true)
    expect(sphere.isFocused).toBe(true)
    // Nothing is rolled, so the effect has no surcharge: just the delivery.
    expect(sphere.manaCost).toBe(2)
  })

  test("the caster can raise the dice afterwards", () => {
    const line = new Line(spell, mods)
    line.setSize(line.baseSize)
    applyCastDefaults(line)

    line.setDamageDice(2)

    expect(line.damageDice).toBe(2)
  })

  test("a Glyph still never starts Focused or cast for effect", () => {
    const glyph = new Glyph(spell, mods)
    applyCastDefaults(glyph)
    expect(glyph.isFocused).toBe(false)
    expect(glyph.applyEffect).toBe(false)
  })

  test("an Imbue keeps its plain defaults", () => {
    const imbue = new Imbue(spell, mods)
    applyCastDefaults(imbue)
    expect(imbue.damageDice).toBe(1)
    expect(imbue.isFocused).toBe(false)
  })

  test("a spell with no damage type isn't given dice", () => {
    const sphere = new Sphere({ ...spell, damageType: "none" }, mods)
    sphere.setSpell({ ...spell, damageType: "none" })
    applyCastDefaults(sphere)
    expect(sphere.damageDice).toBe(0)
  })
})
