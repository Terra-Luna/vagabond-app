import { describe, expect, test } from "@jest/globals"

import { Aura, Cone, Cube, getDeliveryDropdownOptions, getNewDeliveryOptions, Glyph, Imbue, Line, Remote, SpellSnapshot, Sphere, Touch } from "../../../src/combat/spellcasting/SpellDelivery"

const spell: SpellSnapshot = {
    uuid: "x", name: "X", baseManaCost: 0, damageType: 'fire', ignoreEffectCost: false, appliedEffects: []
}

describe('spell delivery mana calc tests', () => {
    test('aura', () => {
        // Setup
        const aura = new Aura(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        aura.size = 35
        // Execute & Verify
        aura.calculateManaCost()
        expect(aura.manaCost).toEqual(7)
    })

    test('aura upcast w/ effect', () => {
        // Setup
        const aura = new Aura(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        aura.size = 35
        aura.applyEffect = true
        aura.damageDice = 3
        // Execute & Verify
        aura.calculateManaCost()
        expect(aura.manaCost).toEqual(10)
    })

    test('cone', () => {
        // Setup
        const cone = new Cone(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        cone.size = 35
        // Execute & Verify
        cone.calculateManaCost()
        expect(cone.manaCost).toEqual(6)
    })
    test('cone upcast w/ effect', () => {
        // Setup
        const cone = new Cone(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        cone.size = 35
        cone.applyEffect = true
        cone.damageDice = 3
        // Execute & Verify
        cone.calculateManaCost()
        expect(cone.manaCost).toEqual(9)
    })

    test('line', () => {
        // Setup
        const line = new Line(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        line.size = 35
        // Execute & Verify
        line.calculateManaCost()
        expect(line.manaCost).toEqual(3)
    })
    test('line upcast w/ effect', () => {
        // Setup
        const line = new Line(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        line.size = 35
        line.applyEffect = true
        line.damageDice = 3
        // Execute & Verify
        line.calculateManaCost()
        expect(line.manaCost).toEqual(6)
    })

    test('sphere', () => {
        // Setup
        const sphere = new Sphere(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        sphere.size = 35
        // Execute & Verify
        sphere.calculateManaCost()
        expect(sphere.manaCost).toEqual(8)
    })
    test('sphere upcast w/ effect', () => {
        // Setup
        const sphere = new Sphere(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        sphere.size = 35
        sphere.applyEffect = true
        sphere.damageDice = 3
        // Execute & Verify
        sphere.calculateManaCost()
        expect(sphere.manaCost).toEqual(11)
    })

    test('cube', () => {
        // Setup
        const cube = new Cube(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        cube.targetCount = 2
        cube.damageDice = 2
        // Execute & Verify
        cube.calculateManaCost()
        expect(cube.manaCost).toEqual(3)
    })
    test('cube upcast w/ effect', () => {
        // Setup
        const cube = new Cube(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        cube.applyEffect = true
        cube.damageDice = 5
        // Execute & Verify
        cube.calculateManaCost()
        expect(cube.manaCost).toEqual(6)
    })

    test('imbue', () => {
        // Setup
        const imbue = new Imbue(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        imbue.targetTokenIds = ['a', 'b', 'c']
        imbue.damageDice = 3
        // Execute & Verify
        imbue.calculateManaCost()
        expect(imbue.manaCost).toEqual(5)
    })

    test('remote single target', () => {
        // Setup
        const remote = new Remote(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        remote.damageDice = 1
        remote.targetCount = 1
        // Execute & Verify
        remote.calculateManaCost()
        expect(remote.manaCost).toEqual(0)
    })
    test('remote', () => {
        // Setup
        const remote = new Remote(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        remote.targetTokenIds = ['a', 'b']
        remote.damageDice = 3
        // Execute & Verify
        remote.calculateManaCost()
        expect(remote.manaCost).toEqual(3)
    })
    test('remote upcast w/ effect', () => {
        // Setup
        const remote = new Remote(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        remote.applyEffect = true
        remote.damageDice = 8
        // Execute & Verify
        remote.calculateManaCost()
        expect(remote.manaCost).toEqual(8)
    })

    test('touch', () => {
        // Setup
        const touch = new Touch(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        // Execute & Verify
        touch.calculateManaCost()
        expect(0).toEqual(touch.manaCost)
    })
    test('touch upcast w/ effect', () => {
        // Setup
        const touch = new Touch(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        touch.applyEffect = true
        touch.damageDice = 6
        // Execute & Verify
        touch.calculateManaCost()
        expect(touch.manaCost).toEqual(6)
        expect(touch.damageDice).toEqual(6)
    })

    test('glyph', () => {
        // Setup
        const glyph = new Glyph(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        // Execute & Verify
        glyph.calculateManaCost()
        expect(glyph.damageDice).toEqual(1)
        expect(glyph.manaCost).toEqual(2)
    })

    test('clone and JSON snapshot preserve delivery state', () => {
        const aura = new Aura(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 2, deliveryDiscounts: { aura: 1 } })
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
            mods: aura.mods
        })
    })

    test('setSpell resets damage dice when spell has no damage type', () => {
        const remote = new Remote(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        remote.damageDice = 4
        remote.setSpell({ ...spell, damageType: 'none' })

        expect(remote.damageDice).toBe(0)
        expect(remote.manaCost).toBe(0)
    })

    test('setDamageDice and study damage dice can be updated without changing the spell', () => {
        const cone = new Cone(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        cone.size = 35
        cone.setDamageDice(4)
        cone.setStudyDamageDice(2)

        expect(cone.damageDice).toBe(4)
        expect(cone.studyDamageDice).toBe(2)
        expect(cone.manaCost).toBe(9)
    })

    test('area delivery discounts and target limits are applied as expected', () => {
        const aura = new Aura(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 3, deliveryDiscounts: { aura: 1 } })
        aura.size = 25
        aura.calculateManaCost()
        expect(aura.manaCost).toBe(1)

        const glyph = new Glyph(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        glyph.setTargetCount(2)
        expect(glyph.manaCost).toBe(3)
    })

    test('getNewDeliveryOptions builds the full delivery catalog and dropdowns', () => {
        const deliveries = getNewDeliveryOptions(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
        expect(deliveries).toHaveLength(9)
        expect(deliveries.map(d => d.name).sort()).toEqual([
            "Aura",
            "Cone",
            "Cube",
            "Glyph",
            "Imbue",
            "Line",
            "Remote",
            "Sphere",
            "Touch"
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
            { label: "Touch", value: 8 }
        ])
    })

    test('remote and imbue handle target token arrays and discounting', () => {
        const remote = new Remote(spell, { damageUpcastDiscount: 2, deliveryUpcastDiscount: 0 })
        remote.setTargetTokenIds(['a', 'b'])
        remote.damageDice = 3
        remote.calculateManaCost()
        expect(remote.manaCost).toBe(3)

        const imbue = new Imbue(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 1 })
        imbue.setTargetTokenIds(['a', 'b', 'c'])
        imbue.damageDice = 3
        imbue.calculateManaCost()
        expect(imbue.manaCost).toBe(4)
    })
})