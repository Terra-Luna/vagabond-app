import { describe, expect, test } from "@jest/globals"
import { Aura, Cone, Line, Sphere, Cube, Imbue, Glyph, Remote, Touch, SpellSnapshot } from "../../../src/combat/spellcasting/SpellDelivery"

const spell: SpellSnapshot = {
    uuid: "x", name: "X", baseManaCost: 0, damageType: 'fire', ignoreEffectCost: false, appliedEffects: []
}

describe('spell delivery mana calc tests', () => {
    test('aura', () => {
        // Setup
        const aura = new Aura(spell)
        aura.size = 35
        // Execute & Verify
        aura.calculateManaCost()
        expect(aura.manaCost).toEqual(7)
    })

    test('aura upcast w/ effect', () => {
        // Setup
        const aura = new Aura(spell)
        aura.size = 35
        aura.applyEffect = true
        aura.damageDice = 3
        // Execute & Verify
        aura.calculateManaCost()
        expect(aura.manaCost).toEqual(10)
    })

    test('cone', () => {
        // Setup
        const cone = new Cone(spell)
        cone.size = 35
        // Execute & Verify
        cone.calculateManaCost()
        expect(cone.manaCost).toEqual(6)
    })
    test('cone upcast w/ effect', () => {
        // Setup
        const cone = new Cone(spell)
        cone.size = 35
        cone.applyEffect = true
        cone.damageDice = 3
        // Execute & Verify
        cone.calculateManaCost()
        expect(cone.manaCost).toEqual(9)
    })

    test('line', () => {
        // Setup
        const line = new Line(spell)
        line.size = 35
        // Execute & Verify
        line.calculateManaCost()
        expect(line.manaCost).toEqual(3)
    })
    test('line upcast w/ effect', () => {
        // Setup
        const line = new Line(spell)
        line.size = 35
        line.applyEffect = true
        line.damageDice = 3
        // Execute & Verify
        line.calculateManaCost()
        expect(line.manaCost).toEqual(6)
    })

    test('sphere', () => {
        // Setup
        const sphere = new Sphere(spell)
        sphere.size = 35
        // Execute & Verify
        sphere.calculateManaCost()
        expect(sphere.manaCost).toEqual(8)
    })
    test('sphere upcast w/ effect', () => {
        // Setup
        const sphere = new Sphere(spell)
        sphere.size = 35
        sphere.applyEffect = true
        sphere.damageDice = 3
        // Execute & Verify
        sphere.calculateManaCost()
        expect(sphere.manaCost).toEqual(11)
    })

    test('cube', () => {
        // Setup
        const cube = new Cube(spell)
        cube.targetCount = 2
        cube.damageDice = 2
        // Execute & Verify
        cube.calculateManaCost()
        expect(cube.manaCost).toEqual(3)
    })
    test('cube upcast w/ effect', () => {
        // Setup
        const cube = new Cube(spell)
        cube.applyEffect = true
        cube.damageDice = 5
        // Execute & Verify
        cube.calculateManaCost()
        expect(cube.manaCost).toEqual(6)
    })

    test('imbue', () => {
        // Setup
        const imbue = new Imbue({ ...spell })
        imbue.targetTokenIds = ['a', 'b', 'c']
        // Execute & Verify
        imbue.calculateManaCost()
        expect(imbue.manaCost).toEqual(3)
    })

    test('remote single target', () => {
        // Setup
        const remote = new Remote(spell)
        remote.damageDice = 1
        remote.targetCount = 1
        // Execute & Verify
        remote.calculateManaCost()
        expect(remote.manaCost).toEqual(0)
    })
    test('remote', () => {
        // Setup
        const remote = new Remote(spell)
        remote.targetTokenIds = ['a', 'b']
        remote.damageDice = 3
        // Execute & Verify
        remote.calculateManaCost()
        expect(remote.manaCost).toEqual(3)
    })
    test('remote upcast w/ effect', () => {
        // Setup
        const remote = new Remote(spell)
        remote.applyEffect = true
        remote.damageDice = 8
        // Execute & Verify
        remote.calculateManaCost()
        expect(remote.manaCost).toEqual(8)
    })

    test('touch', () => {
        // Setup
        const touch = new Touch(spell)
        // Execute & Verify
        touch.calculateManaCost()
        expect(0).toEqual(touch.manaCost)
    })
    test('touch upcast w/ effect', () => {
        // Setup
        const touch = new Touch(spell)
        touch.applyEffect = true
        touch.damageDice = 6
        // Execute & Verify
        touch.calculateManaCost()
        expect(touch.manaCost).toEqual(6)
        expect(touch.damageDice).toEqual(6)
    })

    test('glyph', () => {
        // Setup
        const glyph = new Glyph(spell)
        // Execute & Verify
        glyph.calculateManaCost()
        expect(glyph.damageDice).toEqual(1)
        expect(glyph.manaCost).toEqual(2)
    })

})