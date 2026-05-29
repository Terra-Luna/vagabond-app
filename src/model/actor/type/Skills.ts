import { fields, requiredInteger } from "../../common/sharedSchemas"
import HeroDataModel from "../HeroDataModel"

export const skillsSchema = () => {
    return {
        // Attack skills
        brawl: new fields.SchemaField({ ...skillSchema() }),
        melee: new fields.SchemaField({ ...skillSchema() }),
        finesse: new fields.SchemaField({ ...skillSchema() }),
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

export const skillSchema = (isTrained: boolean = false, stat: number = 2) => {
    return {
        isTrained: new fields.BooleanField({ initial: false }),
        value: new fields.NumberField({ ...requiredInteger, initial: 20 - stat })
    }
}

export const setDifficulties = (hero: HeroDataModel) => {
    const skills = hero.skills
    const stats = hero.stats
    skills.brawl.value = setSkill(Number(stats.might), skills.brawl.isTrained)
    skills.finesse.value = setSkill(Number(stats.dexterity), skills.finesse.isTrained)
    skills.melee.value = setSkill(Number(stats.might), skills.melee.isTrained)
    skills.ranged.value = setSkill(Number(stats.awareness), skills.ranged.isTrained)
    skills.arcana.value = setSkill(Number(stats.reason), skills.arcana.isTrained)
    skills.craft.value = setSkill(Number(stats.reason), skills.craft.isTrained)
    skills.detect.value = setSkill(Number(stats.awareness), skills.detect.isTrained)
    skills.influence.value = setSkill(Number(stats.presence), skills.influence.isTrained)
    skills.leadership.value = setSkill(Number(stats.presence), skills.leadership.isTrained)
    skills.medicine.value = setSkill(Number(stats.reason), skills.medicine.isTrained)
    skills.mysticism.value = setSkill(Number(stats.awareness), skills.mysticism.isTrained)
    skills.performance.value = setSkill(Number(stats.presence), skills.performance.isTrained)
    skills.sneak.value = setSkill(Number(stats.dexterity), skills.sneak.isTrained)
    skills.survival.value = setSkill(Number(stats.awareness), skills.survival.isTrained)
}

export function setSkill(stat: number, isTrained: boolean): number {
    return isTrained ? (20 - stat * 2) : (20 - stat)
}