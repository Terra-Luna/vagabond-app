import AncestryDataModel from "../item/character/AncestryDataModel"
import ClassDataModel from "../item/character/ClassDataModel"
import EquipmentDataModel from "../item/equip/EquipmentDataModel"
import { fields, requiredInteger } from "../foundryHelper"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import SkillsDataModel from "./attribute/SkillsDataModel"
import SpeedDataModel from "./attribute/SpeedDataModel"
import StatsDataModel from "./attribute/StatsDataModel"
import WealthDataModel from "./attribute/WealthDataModel"

const heroSchema = () => {
    return {
        level: new fields.SchemaField({
            current: new fields.NumberField({ integer: true, min: 0, max: 10, initial: 0 }),
            xp: new fields.NumberField({ integer: true, initial: 0 }),
            xpToLevel: new fields.NumberField({ integer: true, initial: 10 })
        }),
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        stats: new fields.SchemaField({ ...StatsDataModel.defineSchema() }),
        fatigue: new fields.NumberField({ choices: [0, 1, 2, 3, 4, 5], initial: 0, max: 5 }),
        speed: new fields.SchemaField({ ...SpeedDataModel.defineSchema() }),
        skills: new fields.SchemaField({ ...SkillsDataModel.defineSchema() }),
        mana: new fields.SchemaField({
            max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            maxCast: new fields.NumberField({ integer: true })
        }),
        inventory: new fields.SchemaField({
            wealth: new fields.SchemaField({ ...WealthDataModel.defineSchema() }),
            maxSlots: new fields.NumberField({ integer: true, min: 8, initial: 8 }),
            slotBonus: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            equipped: new fields.ArrayField(
                new fields.SchemaField({ ...EquipmentDataModel.defineSchema() })
            )
        }),
        boundRelicLimit: new fields.NumberField({ integer: true, initial: 3 })
    }
}

export type HeroDataModelSchema = ReturnType<typeof heroSchema> & BaseActorSchema

export default class HeroDataModel extends ActorDataModel<HeroDataModelSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...heroSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        this.health.max = this.stats.might! * (this.level.current || 1) + this.health.bonus!
        if (typeof this.class.spellcastingData.castSkill !== null) {
            this.mana.max = this.level.current! * this.class.spellcastingData.manaMultiplier!
            this.mana.maxCast = Math.ceil(this.level.current! / 2) + Number(this.stats[this.class.spellcastingData.maxPerCastStat!])
        }
        
        this.inventory.maxSlots = Number(this.stats.might) + 8
    }

}