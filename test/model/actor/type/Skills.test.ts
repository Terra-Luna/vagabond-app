import { describe, expect, test } from "@jest/globals"

import { setSkill, setSkillDifficulties } from "../../../../src/model/actor/HeroDataModel"

describe('test basic skill calc', () => {
    test('test trained', () => {
        // Setup & Execute
        const res = setSkill(3, true)
        // Verify
        expect(res).toEqual(14)
    })
    test('test untrained', () => {
        // Setup & Execute
        const res = setSkill(3, false)
        // Verify
        expect(res).toEqual(17)
    })
})

describe('test hero skill check calcs', () => {
    test('hero skill mega test', () => {
        // Setup
        const hero = { stats: { ...mockStats }, skills: mockSkills }
        // Execute
        setSkillDifficulties(hero as any)
        // Verify
        expect(hero.skills.brawl.value).toEqual(6)
        expect(hero.skills.finesse.value).toEqual(14)
        expect(hero.skills.melee.value).toEqual(13)
        expect(hero.skills.ranged.value).toEqual(15)
        expect(hero.skills.arcana.value).toEqual(16)
        expect(hero.skills.craft.value).toEqual(16)
        expect(hero.skills.detect.value).toEqual(15)
        expect(hero.skills.influence.value).toEqual(14)
        expect(hero.skills.leadership.value).toEqual(17)
        expect(hero.skills.medicine.value).toEqual(16)
        expect(hero.skills.mysticism.value).toEqual(15)
        expect(hero.skills.performance.value).toEqual(17)
        expect(hero.skills.sneak.value).toEqual(8)
        expect(hero.skills.survival.value).toEqual(15)
    })
})

const mockStats = {
    might: 7,
    dexterity: 6,
    awareness: 5,
    reason: 4,
    presence: 3
}

const mockSkills = {
    brawl: { value: 0, trained: true },
    finesse: { value: 0, trained: false },
    melee: { value: 0, trained: false },
    ranged: { value: 0, trained: false },
    arcana: { value: 0, trained: false },
    craft: { value: 0, trained: false },
    detect: { value: 0, trained: false },
    influence: { value: 0, trained: true },
    leadership: { value: 0, trained: false },
    medicine: { value: 0, trained: false },
    mysticism: { value: 0, trained: false },
    performance: { value: 0, trained: false },
    sneak: { value: 0, trained: true },
    survival: { value: 0, trained: false }
}