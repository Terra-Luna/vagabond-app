import { describe, expect, test } from "@jest/globals"
import { Aura, Cone, Line, Sphere, Cube, Imbue, Glyph, Remote, Touch } from "../../../src/combat/spellcasting/SpellDelivery"

describe('spell delivery mana calc tests', () => {
    test('aura', () => {
        // Setup
        const aura = new Aura()
        aura.setSize(35)
        // Execute & Verify
        expect(aura.manaCost).toEqual(7)
    })
    test('aura upcast w/ effect', () => {
        // Setup
        const aura = new Aura()
        aura.setSize(35)
        aura.setUpcast(2)
        aura.setIsDmgOrEffOnly(false)
        // Execute & Verify
        expect(aura.manaCost).toEqual(10)
    })

    test('cone', () => {
        // Setup
        const cone = new Cone()
        cone.setSize(35)
        // Execute & Verify
        expect(cone.manaCost).toEqual(6)
    })
    test('cone upcast w/ effect', () => {
        // Setup
        const cone = new Cone()
        cone.setSize(35)
        cone.setUpcast(2)
        cone.setIsDmgOrEffOnly(false)
        // Execute & Verify
        expect(cone.manaCost).toEqual(9)
    })

    test('line', () => {
        // Setup
        const line = new Line()
        line.setSize(35)
        // Execute & Verify
        expect(line.manaCost).toEqual(3)
    })
    test('line upcast w/ effect', () => {
        // Setup
        const line = new Line()
        line.setSize(35)
        line.setUpcast(2)
        line.setIsDmgOrEffOnly(false)
        // Execute & Verify
        expect(line.manaCost).toEqual(6)
    })

    test('sphere', () => {
        // Setup
        const sphere = new Sphere()
        sphere.setSize(35)
        // Execute & Verify
        expect(sphere.manaCost).toEqual(8)
    })
    test('sphere upcast w/ effect', () => {
        // Setup
        const sphere = new Sphere()
        sphere.setSize(35)
        sphere.setUpcast(2)
        sphere.setIsDmgOrEffOnly(false)
        // Execute & Verify
        expect(sphere.manaCost).toEqual(11)
    })

    test('cube', () => {
        // Setup
        const cube = new Cube()
        cube.setExtraTargets(2)
        // Execute & Verify
        expect(cube.manaCost).toEqual(3)
    })
    test('cube upcast w/ effect', () => {
        // Setup
        const cube = new Cube()
        cube.setExtraTargets(2)
        cube.setUpcast(2)
        cube.setIsDmgOrEffOnly(false)
        // Execute & Verify
        expect(cube.manaCost).toEqual(6)
    })

    test('imbue', () => {
        // Setup
        const imbue = new Imbue()
        imbue.setExtraTargets(2)
        // Execute & Verify
        expect(imbue.manaCost).toEqual(4)
    })

    test('remote single target', () => {
        // Setup
        const remote = new Remote()
        // Execute & Verify
        expect(remote.manaCost).toEqual(0)
        expect(remote.damageDice).toEqual(1)
    })
    test('remote', () => {
        // Setup
        const remote = new Remote()
        remote.setExtraTargets(2)
        // Execute & Verify
        expect(remote.manaCost).toEqual(2)
    })
    test('remote upcast w/ effect', () => {
        // Setup
        const remote = new Remote()
        remote.setExtraTargets(2)
        remote.setUpcast(5)
        remote.setIsDmgOrEffOnly(false)
        // Execute & Verify
        expect(remote.manaCost).toEqual(8)
    })

    test('touch', () => {
        // Setup
        const touch = new Touch()
        // Execute & Verify
        expect(0).toEqual(touch.manaCost)
    })
    test('touch upcast w/ effect', () => {
        // Setup
        const touch = new Touch()
        touch.setUpcast(5)
        touch.setIsDmgOrEffOnly(false)
        // Execute & Verify
        expect(touch.manaCost).toEqual(6)
        expect(touch.damageDice).toEqual(6)
    })

    test('glyph', () => {
        // Setup
        const glyph = new Glyph()
        glyph._updateCastData()
        // Execute & Verify
        expect(glyph.damageDice).toEqual(1)
        expect(glyph.manaCost).toEqual(2)
    })

})