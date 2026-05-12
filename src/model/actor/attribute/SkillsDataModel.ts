import { fields, requiredInteger } from "../../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const skillsSchema = () => {
    return {
        // Weapon skills
        brawl: new fields.SchemaField({ ...skillSchema() }),
        finesse: new fields.SchemaField({ ...skillSchema() }),
        melee: new fields.SchemaField({ ...skillSchema() }),
        ranged: new fields.SchemaField({ ...skillSchema() }),
        // Other skills
        arcana: new fields.SchemaField({ ...skillSchema() }),
        craft: new fields.SchemaField({ ...skillSchema() }),
        detect: new fields.SchemaField({ ...skillSchema() }),
        influence: new fields.SchemaField({ ...skillSchema() }),
        leadership: new fields.SchemaField({ ...skillSchema() }),
        medicine: new fields.SchemaField({ ...skillSchema() }),
        mysticism: new fields.SchemaField({ ...skillSchema() }),
        performance: new fields.SchemaField({ ...skillSchema() }),
        sneak: new fields.SchemaField({ ...skillSchema() }),
        survival: new fields.SchemaField({ ...skillSchema() })
    }
}

const skillSchema = (isTrained: boolean = false, stat: number = 2) => {
    return {
        isTrained: new fields.BooleanField({ initial: false }),
        value: new fields.NumberField({ ...requiredInteger, initial: 20 - stat })
    }
}

export type SkillsSchema = ReturnType<typeof skillsSchema>

export default class SkillsDataModel extends foundry.abstract.TypeDataModel<SkillsSchema, any> {
    static defineSchema() {
        return skillsSchema()
    }

    async calculateDifficulties(hero: HeroDataModel) {
        calculateDifficulties(hero, this)
    }
}

export const calculateDifficulties = (hero: HeroDataModel, skills: SkillsDataModel) => {
    skills.brawl.value = calculateSkill(Number(hero.stats.might), skills.brawl.isTrained)
    skills.finesse.value = calculateSkill(Number(hero.stats.dexterity), skills.finesse.isTrained)
    skills.melee.value = calculateSkill(Number(hero.stats.might), skills.melee.isTrained)
    skills.ranged.value = calculateSkill(Number(hero.stats.awareness), skills.ranged.isTrained)
    skills.arcana.value = calculateSkill(Number(hero.stats.reason), skills.arcana.isTrained)
    skills.craft.value = calculateSkill(Number(hero.stats.reason), skills.craft.isTrained)
    skills.detect.value = calculateSkill(Number(hero.stats.awareness), skills.detect.isTrained)
    skills.influence.value = calculateSkill(Number(hero.stats.presence), skills.influence.isTrained)
    skills.leadership.value = calculateSkill(Number(hero.stats.presence), skills.leadership.isTrained)
    skills.medicine.value = calculateSkill(Number(hero.stats.reason), skills.medicine.isTrained)
    skills.mysticism.value = calculateSkill(Number(hero.stats.awareness), skills.mysticism.isTrained)
    skills.performance.value = calculateSkill(Number(hero.stats.presence), skills.performance.isTrained)
    skills.sneak.value = calculateSkill(Number(hero.stats.dexterity), skills.sneak.isTrained)
    skills.survival.value = calculateSkill(Number(hero.stats.awareness), skills.survival.isTrained)
}

export function calculateSkill(stat: number, isTrained: boolean): number {
    return isTrained ? (20 - stat * 2) : (20 - stat)
}