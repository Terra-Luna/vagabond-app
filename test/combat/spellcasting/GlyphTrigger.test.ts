import { describe, expect, it, jest } from "@jest/globals"

import { GlyphTrigger } from "../../../src/combat/spellcasting/GlyphTrigger"
import { Glyph, type SpellSnapshot } from "../../../src/combat/spellcasting/SpellDelivery"

jest.mock(
  "../../../src/combat/spellcasting/aoe/targeting/AreaOccupants",
  () => ({
    AreaOccupants: {
      tokensIn: (points: { x: number; y: number }[]) =>
        points.some((p) => p.x === 50)
          ? [{ document: { id: "a" } }, { document: { id: "b" } }]
          : [],
    },
  }),
)

const spell: SpellSnapshot = {
  uuid: "s",
  name: "Zap",
  baseManaCost: 1,
  damageType: "shock",
  ignoreEffectCost: false,
  appliedEffects: [],
  img: "",
  description: "",
  upcastableEffect: false,
  upcastableEffectDieRoll: false,
}
const mods = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }
const glyph = (over: Partial<SpellSnapshot> = {}) => ({
  id: "g",
  sceneId: "scene",
  cell: { x: 50, y: 50 },
  skill: "arcana",
  spell: { ...spell, ...over },
})

describe("Glyph placement", () => {
  it("only ever pays for the Glyph; Focus, effect and dice are chosen on triggering", () => {
    const placed = new Glyph(spell, mods)
    placed.setDamageDice(5)
    placed.setApplyEffect(true)
    placed.setIsFocused(true)

    expect(placed.damageDice).toBe(1)
    expect(placed.applyEffect).toBe(false)
    expect(placed.isFocused).toBe(false)
    // 2 for the Glyph + 1 for the spell's own base cost, which a damaging cast pays.
    expect(placed.manaCost).toBe(3)
  })
})

describe("GlyphTrigger", () => {
  it("finds everyone standing on the Glyph, and nobody elsewhere", () => {
    expect(GlyphTrigger.occupantIds(glyph())).toEqual(["a", "b"])
    expect(
      GlyphTrigger.occupantIds({ ...glyph(), cell: { x: 5, y: 5 } }),
    ).toEqual([])
  })

  it("casts as a Cube whose base cost is already paid", () => {
    const cube = GlyphTrigger.deliveryFor(glyph(), mods, {
      dice: 1,
      effect: false,
      focused: false,
    })
    expect(cube.name).toBe("Cube")
    expect(cube.manaCost).toBe(0)
  })

  it("only charges for what the caster adds", () => {
    const extraDice = GlyphTrigger.deliveryFor(glyph(), mods, {
      dice: 3,
      effect: false,
      focused: false,
    })
    expect(extraDice.manaCost).toBe(2)

    const withEffect = GlyphTrigger.deliveryFor(glyph(), mods, {
      dice: 1,
      effect: true,
      focused: true,
    })
    expect(withEffect.manaCost).toBe(1)
    expect(withEffect.isFocused).toBe(true)
  })

  it("an effect-only cast of a damaging spell doesn't get the spell's base cost for free", () => {
    const cube = GlyphTrigger.deliveryFor(glyph(), mods, {
      dice: 0,
      effect: true,
      focused: false,
    })
    // Cube base 1 prepaid; the effect itself needs no extra surcharge without damage dice.
    expect(cube.damageDice).toBe(0)
    expect(cube.manaCost).toBe(0)
  })

  it("keeps the spell's own discount, and its limits", () => {
    const discounted = GlyphTrigger.deliveryFor(
      glyph({ manaDiscount: 1 }),
      mods,
      { dice: 3, effect: false, focused: false },
    )
    expect(discounted.manaCost).toBe(1)

    const fixed = GlyphTrigger.deliveryFor(glyph({ noUpcast: true }), mods, {
      dice: 3,
      effect: false,
      focused: false,
    })
    expect(fixed.damageDice).toBe(1)
    expect(fixed.manaCost).toBe(0)
  })

  it("casts on the Glyph's square", () => {
    expect(GlyphTrigger.areaOf(glyph())).toMatchObject({
      sceneId: "scene",
      cells: [{ x: 50, y: 50 }],
    })
  })
})
