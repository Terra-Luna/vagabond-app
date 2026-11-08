import { describe, expect, test } from "@jest/globals"

import { applyCastDefaults } from "../../../src/combat/spellcasting/cast-defaults"
import { restoreMenuState, type SpellcastingMenuState, spellStateKey } from "../../../src/combat/spellcasting/menu-state"
import { Line, type SpellSnapshot, Sphere } from "../../../src/combat/spellcasting/SpellDelivery"

const spell = (uuid: string): SpellSnapshot => ({
  uuid,
  name: uuid,
  baseManaCost: 0,
  damageType: "fire",
  ignoreEffectCost: false,
  appliedEffects: [],
  img: "",
  description: "",
  upcastableEffect: false,
  upcastableEffectDieRoll: false,
})
const mods = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }

const settings = (over: Partial<SpellcastingMenuState> = {}) => ({
  skill: "arcana",
  spellUuid: "a",
  deliveryName: "Sphere",
  damageDice: 2,
  studyDamageDice: 0,
  applyEffect: false,
  isFocused: true,
  discount: 0,
  size: 15,
  ...over,
})

describe("menu state", () => {
  test("a uuid becomes a key safe to use in a flag path", () => {
    expect(spellStateKey("Compendium.vagabond-app.spells.Item.abc")).toBe(
      "Compendium_vagabond-app_spells_Item_abc",
    )
  })

  test("a spell's menu comes back as it was last set, whatever the other spell was set to", () => {
    const savedForA = settings()
    const a = new Sphere(spell("a"), mods)
    const b = new Sphere(spell("b"), mods)
    b.setSize(b.baseSize)
    applyCastDefaults(a)
    applyCastDefaults(b)

    restoreMenuState(a, savedForA)

    expect([a.damageDice, a.applyEffect, a.isFocused, a.size]).toEqual([
      2,
      false,
      true,
      15,
    ])
    // The other spell starts from the defaults, untouched by A's settings.
    expect([b.damageDice, b.applyEffect, b.isFocused, b.size]).toEqual([
      0,
      true,
      true,
      b.baseSize,
    ])
  })

  test("only the delivery's own settings are restored", () => {
    const line = new Line(spell("a"), mods)
    restoreMenuState(
      line,
      settings({ deliveryName: "Line", size: 60, height: 20, width: 10 }),
    )
    expect([line.size, line.height, line.width]).toEqual([60, 20, 10])
  })
})
