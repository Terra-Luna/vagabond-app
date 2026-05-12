import { fields, requiredInteger } from "../../common/sharedSchemas"
import AncestryDataModel from "../item/character/ancestry/AncestryDataModel"
import ClassDataModel from "../item/character/ClassDataModel"
import EquipmentDataModel from "../item/equip/EquipmentDataModel"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { coinSchema, CoinValue, consolidate } from "./attribute/CoinValue"
import LevelDataModel from "./attribute/LevelDataModel"
import ManaDataModel from "./attribute/ManaDataModel"
import SavesDataModel from "./attribute/SavesDataModel"
import SkillsDataModel from "./attribute/SkillsDataModel"
import SpeedDataModel from "./attribute/SpeedDataModel"
import StatsDataModel from "./attribute/StatsDataModel"

const heroSchema = () => {
    return {
        level: new fields.SchemaField({ ...LevelDataModel.defineSchema() }),
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        stats: new fields.SchemaField({ ...StatsDataModel.defineSchema() }),
        saves: new fields.SchemaField({ ...SavesDataModel.defineSchema() }),
        fatigue: new fields.NumberField({ choices: [0, 1, 2, 3, 4, 5], initial: 0, max: 5 }),
        speed: new fields.SchemaField({ ...SpeedDataModel.defineSchema() }),
        skills: new fields.SchemaField({ ...SkillsDataModel.defineSchema() }),
        mana: new fields.SchemaField({ ...ManaDataModel.defineSchema() }),
        inventory: new fields.SchemaField({
            coins: new fields.SchemaField({ ...coinSchema() }),
            occupiedSlots: new fields.NumberField({ ...requiredInteger, initial: 0 }),
            maxSlots: new fields.NumberField({ integer: true, min: 8, initial: 8 }),
            slotBonus: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            items: new fields.ArrayField( new fields.SchemaField({ ...EquipmentDataModel.defineSchema() }), { initial: [] } ),
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
        
        this.deriveHealth()
        this.deriveSaves()
        this.deriveMana()
        this.deriveInventoryData()
        
    }

    deriveHealth() {
        this.health.max = this.stats.might! * (this.level.current || 1) + this.health.bonus!
    }

    /**
     * TODO: hook up the bonuses to a UI component on the hero sheet, maybe some +/- buttons?
     */
    deriveSaves() {
        const base = 20
        this.saves.reflex = base - this.stats.dexterity! + this.stats.awareness!
        this.saves.reflexBonus = 0
        this.saves.endure = base - this.stats.might! * 2
        this.saves.endureBonus = 0
        this.saves.will = base - this.stats.reason! + this.stats.presence!
        this.saves.willBonus = 0
    }

    deriveMana() {
        if (typeof this.class.spellcastingData.castSkill !== null) {
            this.mana.max = this.level.current || 0 * this.class.spellcastingData.manaMultiplier!
            this.mana.maxCast = Math.ceil((this.level.current || 0) / 2) + Number(this.stats[this.class.spellcastingData.maxPerCastStat || 0])
        }
    }

    deriveInventoryData() {
        consolidate(this.inventory.coins as CoinValue)
        this.inventory.items.forEach((i) => this.inventory.occupiedSlots! += i.slots!)
        this.inventory.maxSlots = Number(this.stats.might) + 8 + this.inventory.slotBonus!
    }

}