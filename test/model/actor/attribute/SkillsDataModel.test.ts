import { describe, expect, test } from "@jest/globals"
import { calculateSkill, calculateDifficulties } from "../../../../src/model/actor/attribute/SkillsDataModel"
import HeroDataModel from "../../../../src/model/actor/HeroDataModel"
import SkillsDataModel from "../../../../src/model/actor/attribute/SkillsDataModel"

describe('test basic skill calc', () => {
    test('test trained', () => {
        // Setup & Execute
        const res = calculateSkill(3, true)
        // Verify
        expect(res).toEqual(14)
    })
    test('test untrained', () => {
        // Setup & Execute
        const res = calculateSkill(3, false)
        // Verify
        expect(res).toEqual(17)
    })
})

describe('test hero skill check calcs', () => {
    test('hero skill mega test', () => {
        // Setup
        const hero = { stats: { ...mockStats } } as unknown as HeroDataModel
        const skills = { ...mockSkills } 
        // Execute
        calculateDifficulties(hero, skills as unknown as SkillsDataModel)
        // Verify
        expect(skills.brawl.value).toEqual(6)
        expect(skills.finesse.value).toEqual(14)
        expect(skills.melee.value).toEqual(13)
        expect(skills.ranged.value).toEqual(15)
        expect(skills.arcana.value).toEqual(16)
        expect(skills.craft.value).toEqual(16)
        expect(skills.detect.value).toEqual(15)
        expect(skills.influence.value).toEqual(14)
        expect(skills.leadership.value).toEqual(17)
        expect(skills.medicine.value).toEqual(16)
        expect(skills.mysticism.value).toEqual(15)
        expect(skills.performance.value).toEqual(17)
        expect(skills.sneak.value).toEqual(8)
        expect(skills.survival.value).toEqual(15)
    })
})

const mockStats = {
    might: 7, dexterity: 6, awareness: 5, reason: 4, presence: 3
}

const mockSkills = {
    brawl: { value: 0, isTrained: true },
    finesse: { value: 0, isTrained: false },
    melee: { value: 0, isTrained: false },
    ranged: { value: 0, isTrained: false },
    arcana: { value: 0, isTrained: false },
    craft: { value: 0, isTrained: false },
    detect: { value: 0, isTrained: false },
    influence: { value: 0, isTrained: true },
    leadership: { value: 0, isTrained: false },
    medicine: { value: 0, isTrained: false },
    mysticism: { value: 0, isTrained: false },
    performance: { value: 0, isTrained: false },
    sneak: { value: 0, isTrained: true },
    survival: { value: 0, isTrained: false }
}