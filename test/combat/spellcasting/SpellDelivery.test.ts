import { describe, expect, test } from "@jest/globals"

import { Aura, Cone, Cube, getDeliveryDropdownOptions, getNewDeliveryOptions, Glyph, Imbue, Line, Remote, SpellDelivery, SpellSnapshot, Sphere, Touch } from "../../../src/combat/spellcasting/SpellDelivery"

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

describe("spell delivery mana calc tests", () => {
  test("aura", () => {
    // Setup
    const aura = new Aura(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    aura.size = 35
    // Execute & Verify
    aura.calculateManaCost()
    expect(aura.manaCost).toEqual(7)
  })

  test("aura upcast w/ effect", () => {
    // Setup
    const aura = new Aura(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    aura.size = 35
    aura.applyEffect = true
    aura.damageDice = 3
    // Execute & Verify
    aura.calculateManaCost()
    expect(aura.manaCost).toEqual(10)
  })

  test("cone", () => {
    // Setup
    const cone = new Cone(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    cone.size = 35
    // Execute & Verify
    cone.calculateManaCost()
    expect(cone.manaCost).toEqual(6)
  })
  test("cone upcast w/ effect", () => {
    // Setup
    const cone = new Cone(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    cone.size = 35
    cone.applyEffect = true
    cone.damageDice = 3
    // Execute & Verify
    cone.calculateManaCost()
    expect(cone.manaCost).toEqual(9)
  })

  test("line", () => {
    // Setup
    const line = new Line(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    line.size = 35
    // Execute & Verify
    line.calculateManaCost()
    expect(line.manaCost).toEqual(3)
  })
  test("line upcast w/ effect", () => {
    // Setup
    const line = new Line(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    line.size = 35
    line.applyEffect = true
    line.damageDice = 3
    // Execute & Verify
    line.calculateManaCost()
    expect(line.manaCost).toEqual(6)
  })

  test("sphere", () => {
    // Setup
    const sphere = new Sphere(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    sphere.size = 35
    // Execute & Verify
    sphere.calculateManaCost()
    expect(sphere.manaCost).toEqual(8)
  })
  test("sphere upcast w/ effect", () => {
    // Setup
    const sphere = new Sphere(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    sphere.size = 35
    sphere.applyEffect = true
    sphere.damageDice = 3
    // Execute & Verify
    sphere.calculateManaCost()
    expect(sphere.manaCost).toEqual(11)
  })

  test("cube", () => {
    // Setup
    const cube = new Cube(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    cube.targetCount = 2
    cube.damageDice = 2
    // Execute & Verify
    cube.calculateManaCost()
    expect(cube.manaCost).toEqual(3)
  })
  test("cube upcast w/ effect", () => {
    // Setup
    const cube = new Cube(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    cube.applyEffect = true
    cube.damageDice = 5
    // Execute & Verify
    cube.calculateManaCost()
    expect(cube.manaCost).toEqual(6)
  })

  test("imbue", () => {
    // Setup
    const imbue = new Imbue(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    imbue.targetTokenIds = ["a", "b", "c"]
    imbue.damageDice = 3
    // Execute & Verify
    imbue.calculateManaCost()
    expect(imbue.manaCost).toEqual(5)
  })

  test("remote single target", () => {
    // Setup
    const remote = new Remote(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    remote.damageDice = 1
    remote.targetCount = 1
    // Execute & Verify
    remote.calculateManaCost()
    expect(remote.manaCost).toEqual(0)
  })
  test("remote", () => {
    // Setup
    const remote = new Remote(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    remote.targetTokenIds = ["a", "b"]
    remote.damageDice = 3
    // Execute & Verify
    remote.calculateManaCost()
    expect(remote.manaCost).toEqual(3)
  })
  test("remote upcast w/ effect", () => {
    // Setup
    const remote = new Remote(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    remote.applyEffect = true
    remote.damageDice = 8
    // Execute & Verify
    remote.calculateManaCost()
    expect(remote.manaCost).toEqual(8)
  })

  test("touch", () => {
    // Setup
    const touch = new Touch(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    // Execute & Verify
    touch.calculateManaCost()
    expect(0).toEqual(touch.manaCost)
  })
  test("touch upcast w/ effect", () => {
    // Setup
    const touch = new Touch(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    touch.applyEffect = true
    touch.damageDice = 6
    // Execute & Verify
    touch.calculateManaCost()
    expect(touch.manaCost).toEqual(6)
    expect(touch.damageDice).toEqual(6)
  })

  test("glyph", () => {
    // Setup
    const glyph = new Glyph(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    // Execute & Verify
    glyph.calculateManaCost()
    expect(glyph.damageDice).toEqual(1)
    expect(glyph.manaCost).toEqual(2)
  })

  test("clone and JSON snapshot preserve delivery state", () => {
    const aura = new Aura(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 2,
      deliveryDiscounts: { aura: 1 },
    })
    aura.size = 25
    aura.applyEffect = true
    aura.damageDice = 3
    aura.setDiscount(3)

    const clone = aura.clone()
    expect(clone).not.toBe(aura)
    expect(clone.manaCost).toEqual(aura.manaCost)

    clone.setApplyEffect(false)
    clone.setDiscount(0)
    expect(clone.manaCost).not.toEqual(aura.manaCost)

    expect(clone.toJson()).toMatchObject({
      name: aura.name,
      applyEffect: false,
      spell: spell,
      mods: aura.mods,
    })
  })

  test("setSpell resets damage dice when spell has no damage type", () => {
    const remote = new Remote(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    remote.damageDice = 4
    remote.setSpell({ ...spell, damageType: "none" })

    expect(remote.damageDice).toBe(0)
    expect(remote.manaCost).toBe(0)
  })

  test("setDamageDice and study damage dice can be updated without changing the spell", () => {
    const cone = new Cone(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    cone.size = 35
    cone.setDamageDice(4)
    cone.setStudyDamageDice(2)

    expect(cone.damageDice).toBe(4)
    expect(cone.studyDamageDice).toBe(2)
    expect(cone.manaCost).toBe(9)
  })

  test("area delivery discounts and target limits are applied as expected", () => {
    const aura = new Aura(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 3,
      deliveryDiscounts: { aura: 1 },
    })
    aura.size = 25
    aura.calculateManaCost()
    expect(aura.manaCost).toBe(1)

    const glyph = new Glyph(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    glyph.setTargetCount(2)
    expect(glyph.manaCost).toBe(3)
  })

  test("getNewDeliveryOptions builds the full delivery catalog and dropdowns", () => {
    const deliveries = getNewDeliveryOptions(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 0,
    })
    expect(deliveries).toHaveLength(9)
    expect(deliveries.map((d) => d.name).sort()).toEqual([
      "Aura",
      "Cone",
      "Cube",
      "Glyph",
      "Imbue",
      "Line",
      "Remote",
      "Sphere",
      "Touch",
    ])

    expect(getDeliveryDropdownOptions(deliveries)).toEqual([
      { label: "Aura", value: 0 },
      { label: "Cone", value: 1 },
      { label: "Cube", value: 2 },
      { label: "Glyph", value: 3 },
      { label: "Imbue", value: 4 },
      { label: "Line", value: 5 },
      { label: "Remote", value: 6 },
      { label: "Sphere", value: 7 },
      { label: "Touch", value: 8 },
    ])
  })

  test("remote and imbue handle target token arrays and discounting", () => {
    const remote = new Remote(spell, {
      damageUpcastDiscount: 2,
      deliveryUpcastDiscount: 0,
    })
    remote.setTargetTokenIds(["a", "b"])
    remote.damageDice = 3
    remote.calculateManaCost()
    expect(remote.manaCost).toBe(3)

    const imbue = new Imbue(spell, {
      damageUpcastDiscount: 0,
      deliveryUpcastDiscount: 1,
    })
    imbue.setTargetTokenIds(["a", "b", "c"])
    imbue.damageDice = 3
    imbue.calculateManaCost()
    expect(imbue.manaCost).toBe(4)
  })
})

describe("spell mana discount flag", () => {
  const mods = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }

  test("discounts the cast on top of modifier discounts", () => {
    const aura = new Aura(
      { ...spell, manaDiscount: 2 },
      {
        ...mods,
        deliveryDiscounts: { aura: 1 },
      },
    )
    aura.size = 35
    aura.calculateManaCost()
    expect(aura.manaCost).toBe(4)
  })

  test("a negative value is a penalty", () => {
    const remote = new Remote({ ...spell, manaDiscount: -2 }, mods)
    remote.setTargetTokenIds(["a"])
    remote.damageDice = 1
    remote.calculateManaCost()
    expect(remote.manaCost).toBe(2)
  })

  test("never brings the cost below zero", () => {
    const sphere = new Sphere({ ...spell, manaDiscount: 50 }, mods)
    sphere.calculateManaCost()
    expect(sphere.manaCost).toBe(0)
  })

  test("applies to every delivery, including Line and Cube", () => {
    const line = new Line({ ...spell, manaDiscount: 1 }, mods)
    line.calculateManaCost()
    const baseline = new Line(spell, mods)
    baseline.calculateManaCost()
    expect(line.manaCost).toBe(Math.max(0, baseline.manaCost - 1))

    const cube = new Cube({ ...spell, manaDiscount: -1 }, mods)
    cube.calculateManaCost()
    const cubeBase = new Cube(spell, mods)
    cubeBase.calculateManaCost()
    expect(cube.manaCost).toBe(cubeBase.manaCost + 1)
  })
})

describe("spell deliveryDiscount flag", () => {
  const mods = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }

  test("takes its amount off the delivery, on any delivery", () => {
    const sphere = new Sphere({ ...spell, deliveryDiscount: 1 }, mods)
    sphere.setSize(sphere.baseSize)
    expect(sphere.manaCost).toBe(1)

    const remote = new Remote({ ...spell, deliveryDiscount: 1 }, mods)
    remote.setTargetTokenIds(["a", "b"])
    remote.damageDice = 1
    remote.calculateManaCost()
    // Two targets cost 1 extra; the discount takes it back.
    expect(remote.manaCost).toBe(0)
  })

  test("adds to the casting modifiers' delivery discounts", () => {
    const sphere = new Sphere(
      { ...spell, deliveryDiscount: 1 },
      { ...mods, deliveryDiscounts: { sphere: 1 } },
    )
    sphere.setSize(sphere.baseSize)
    expect(sphere.manaCost).toBe(0)

    const plain = new Sphere(spell, {
      ...mods,
      deliveryDiscounts: { sphere: 1 },
    })
    plain.setSize(plain.baseSize)
    expect(plain.manaCost).toBe(1)
  })

  test("stacks with the spell's mana discount, and never goes below zero", () => {
    const sphere = new Sphere(
      { ...spell, deliveryDiscount: 1, manaDiscount: 1 },
      mods,
    )
    sphere.setSize(sphere.baseSize)
    expect(sphere.manaCost).toBe(0)

    const big = new Sphere({ ...spell, deliveryDiscount: 50 }, mods)
    big.setSize(big.baseSize)
    expect(big.manaCost).toBe(0)
  })

  test("never discounts extra damage dice or the effect surcharge", () => {
    // A Sphere is 2 Mana. 3 damage dice add 2, and casting damage with its effect adds 1.
    const sphere = new Sphere({ ...spell, deliveryDiscount: 5 }, mods)
    sphere.setSize(sphere.baseSize)
    sphere.setDamageDice(3)
    sphere.setApplyEffect(true)

    // Only the Delivery's own 2 Mana is discounted; the 2 dice + 1 effect (3) remain.
    expect(sphere.manaCost).toBe(3)

    const modifiers = new Sphere(spell, {
      ...mods,
      deliveryDiscounts: { sphere: 5 },
    })
    modifiers.setSize(modifiers.baseSize)
    modifiers.setDamageDice(3)
    modifiers.setApplyEffect(true)
    expect(modifiers.manaCost).toBe(3)
  })

  test("is limited to what the Delivery costs, after the upcast discounts", () => {
    // 15' is one step of upcast: 3 Mana for the Delivery, 1 of it already discounted.
    const sphere = new Sphere(
      { ...spell, deliveryDiscount: 5 },
      { damageUpcastDiscount: 0, deliveryUpcastDiscount: 1 },
    )
    sphere.setSize(sphere.baseSize + 5)
    expect(sphere.manaCost).toBe(0)

    const remote = new Remote({ ...spell, deliveryDiscount: 5 }, mods)
    remote.setTargetTokenIds(["a", "b", "c"])
    remote.setDamageDice(2)
    // Delivery: 2 extra targets = 2 Mana, discounted; the extra die (1) stays.
    expect(remote.manaCost).toBe(1)
  })

  test("a line's delivery discounts apply too", () => {
    const line = new Line({ ...spell, deliveryDiscount: 1 }, mods)
    line.setSize(line.baseSize)
    expect(line.manaCost).toBe(1)

    const viaModifiers = new Line(spell, {
      ...mods,
      deliveryDiscounts: { line: 1 },
    })
    viaModifiers.setSize(viaModifiers.baseSize)
    expect(viaModifiers.manaCost).toBe(1)
  })

  test("remote: the first extra target is free, so 1 damage die + effect costs the same for 1 or 2 targets", () => {
    const remoteCost = (targets: number, mods: any) => {
      const remote = new Remote({ ...spell, deliveryDiscount: 1 }, mods)
      remote.setDamageDice(1)
      remote.setApplyEffect(true)
      remote.setTargetTokenIds(
        Array.from({ length: targets }, (_, i) => `t${i}`),
      )
      return remote.manaCost
    }
    const plain = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }
    expect([1, 2, 3, 4].map((n) => remoteCost(n, plain))).toEqual([1, 1, 2, 3])

    // A big upcast discount can't reach past the extra targets' own cost either.
    const generous = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 5 }
    expect([1, 2, 3, 4].map((n) => remoteCost(n, generous))).toEqual([
      1, 1, 1, 1,
    ])
  })

  test("is read from the flag as a number, or true for 1", () => {
    const item: any = {
      uuid: "u",
      name: "N",
      system: {
        description: "",
        damageType: "fire",
        baseManaCost: 0,
        ignoreEffectCost: false,
        appliedEffects: [],
        appliedActiveEffects: [],
        upcastableEffect: false,
        upcastableEffectDieRoll: false,
      },
    }
    const read = (flags: any) =>
      SpellDelivery.getSpellSnapshot(item, flags).deliveryDiscount

    expect(read({ modifiers: { spell: { deliveryDiscount: true } } })).toBe(1)
    expect(read({ modifiers: { spell: { deliveryDiscount: 2 } } })).toBe(2)
    expect(read({})).toBeUndefined()
  })
})

describe("spell noUpcast flag", () => {
  const mods = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }
  const fixed: SpellSnapshot = { ...spell, noUpcast: true }

  test("an area can't grow", () => {
    const sphere = new Sphere(fixed, mods)
    sphere.setSize(35)
    expect(sphere.size).toBe(sphere.baseSize)
    expect(sphere.manaCost).toBe(2)

    const line = new Line(fixed, mods)
    line.setSize(60)
    line.setHeight(40)
    line.setWidth(20)
    expect([line.size, line.height, line.width]).toEqual([30, 10, 5])
    expect(line.manaCost).toBe(2)
  })

  test("a delivery set up for another spell is reset when the spell is selected", () => {
    const aura = new Aura(spell, mods)
    aura.setSize(35)
    aura.setUpcast(2)
    aura.setDamageDice(3)

    aura.setSpell(fixed)

    expect(aura.size).toBe(aura.baseSize)
    expect(aura.upcast).toBe(0)
    expect(aura.damageDice).toBe(1)
    expect(aura.manaCost).toBe(2)
  })

  test("can't be upcast or cast for more than one damage die", () => {
    const sphere = new Sphere(fixed, mods)
    sphere.setUpcast(3)
    sphere.setDamageDice(4)
    expect(sphere.upcast).toBe(0)
    expect(sphere.damageDice).toBe(1)
  })

  test("is cast for its damage or for its effect, never both", () => {
    const sphere = new Sphere(fixed, mods)
    sphere.setSize(sphere.baseSize)

    sphere.setApplyEffect(true)
    expect([sphere.applyEffect, sphere.damageDice]).toEqual([true, 0])

    sphere.setDamageDice(1)
    expect([sphere.applyEffect, sphere.damageDice]).toEqual([false, 1])
    expect(sphere.manaCost).toBe(2)

    sphere.setApplyEffect(false)
    expect(sphere.damageDice).toBe(1)
  })

  test("a spell that doesn't charge for its effect can still do both", () => {
    const free = new Sphere({ ...fixed, ignoreEffectCost: true }, mods)
    free.setApplyEffect(true)
    expect([free.applyEffect, free.damageDice]).toEqual([true, 1])
  })

  test("remote is always one target", () => {
    const remote = new Remote(fixed, mods)
    remote.setTargetTokenIds(["a", "b", "c"])

    expect(remote.targetCount).toBe(1)
    expect(remote.manaCost).toBe(0)
    expect(remote.hasExtraTargets).toBe(true)

    remote.setTargetTokenIds(["a"])
    expect(remote.hasExtraTargets).toBe(false)
  })

  test("a cube or glyph can't be extended", () => {
    const cube = new Cube(fixed, mods)
    cube.setTargetCount(4)
    expect(cube.targetCount).toBe(1)
    expect(cube.manaCost).toBe(cube.baseManaCost)
  })

  test("other spells are unaffected", () => {
    const sphere = new Sphere(spell, mods)
    sphere.setSize(35)
    sphere.setApplyEffect(true)
    expect(sphere.size).toBe(35)
    expect(sphere.hasFixedCost).toBe(false)
  })
})

describe("spell noManaBoost flag", () => {
  const capped: SpellSnapshot = { ...spell, noManaBoost: true }
  const noDiscounts = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 }
  const discounted = { damageUpcastDiscount: 0, deliveryUpcastDiscount: 1 }

  test("without discounts nothing can be upcast", () => {
    const sphere = new Sphere(capped, noDiscounts)
    sphere.setSize(sphere.baseSize)
    sphere.setSize(25)
    expect(sphere.size).toBe(sphere.baseSize)
    expect(sphere.manaCost).toBe(2)
  })

  test("upcasting is allowed while discounts keep the cost at the base cost", () => {
    const sphere = new Sphere(capped, discounted)
    sphere.setSize(sphere.baseSize)

    sphere.setSize(25)

    // One step is paid for by the discount; a second would push the cost to 3.
    expect(sphere.size).toBe(10)
    expect(sphere.manaCost).toBe(2)
  })

  test("damage dice and the effect surcharge stop at the cap too", () => {
    const sphere = new Sphere(capped, noDiscounts)
    sphere.setSize(sphere.baseSize)

    sphere.setDamageDice(4)
    expect(sphere.damageDice).toBe(1)

    sphere.setApplyEffect(true)
    expect(sphere.applyEffect).toBe(false)
    expect(sphere.manaCost).toBe(2)
  })

  test("a line can't be widened past the cap", () => {
    const line = new Line(capped, noDiscounts)
    line.setSize(line.baseSize)
    line.setHeight(40)
    line.setWidth(20)
    expect([line.height, line.width]).toEqual([10, 5])
    expect(line.manaCost).toBe(2)
  })

  test("a penalty doesn't make the base cast uncastable", () => {
    const sphere = new Sphere({ ...capped, manaDiscount: -1 }, noDiscounts)
    sphere.setSize(sphere.baseSize)
    sphere.setSize(25)
    expect(sphere.size).toBe(sphere.baseSize)
    expect(sphere.exceedsManaCap).toBe(false)
  })

  test("a delivery configured for another spell is stepped down when the spell is selected", () => {
    const sphere = new Sphere(spell, noDiscounts)
    sphere.setSize(25)
    sphere.setSpell(capped)
    expect(sphere.size).toBe(sphere.baseSize)
  })

  test("cubes are limited to what the cap allows", () => {
    const cube = new Cube(capped, discounted)
    expect(cube.maxTargetCount).toBe(2)
    cube.setTargetCount(5)
    expect(cube.targetCount).toBe(2)
    expect(new Cube(spell, discounted).maxTargetCount).toBeUndefined()
  })

  test("remote can't be cast on more targets than the cap allows", () => {
    const remote = new Remote(capped, noDiscounts)
    remote.setTargetTokenIds(["a", "b"])
    expect(remote.exceedsManaCap).toBe(true)

    remote.setTargetTokenIds(["a"])
    expect(remote.exceedsManaCap).toBe(false)

    const covered = new Remote(capped, discounted)
    covered.setTargetTokenIds(["a", "b"])
    expect(covered.exceedsManaCap).toBe(false)
  })

  test("other spells are unaffected", () => {
    const sphere = new Sphere(spell, noDiscounts)
    sphere.setSize(25)
    expect(sphere.size).toBe(25)
    expect(sphere.exceedsManaCap).toBe(false)
  })
})
