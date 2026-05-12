import { CoinValue,consolidate } from "../common/CoinValue"
import { fields } from "../common/sharedSchemas"
import AncestryDataModel from "../item/character/ancestry/AncestryDataModel"
import ClassDataModel from "../item/character/ClassDataModel"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { inventorySchema } from "./attribute/Inventory"
import { levelSchema } from "./attribute/Level"
import { manaSchema } from "./attribute/Mana"
import { savesSchema } from "./attribute/Saves"
import { calculateDifficulties, skillsSchema } from "./attribute/Skills"
import { calculateSpeeds, speedSchema } from "./attribute/Speed"
import { statsSchema } from "./attribute/Stats"

const heroSchema = () => {
    return {
        level: new fields.SchemaField({ ...levelSchema() }),
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        stats: new fields.SchemaField({ ...statsSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        fatigue: new fields.NumberField({ choices: [0, 1, 2, 3, 4, 5], initial: 0, max: 5 }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        mana: new fields.SchemaField({ ...manaSchema() }),
        inventory: new fields.SchemaField({ ...inventorySchema() }),
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
        this.deriveSkillDifficulties()
        this.deriveSpeed()
        this.deriveInventoryData()
    }

    /**
     * MaxHP = Might x 2 + bonus, where bonus is the sum of all active effects of type 'system.health.bonus'.
     */
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
            this.mana.max = this.level.current! * this.class.spellcastingData.manaMultiplier!
            this.mana.maxCast = Math.ceil((this.level.current!) / 2) + Number(this.stats[this.class.spellcastingData.maxPerCastStat!])
        }
    }

    deriveSkillDifficulties() {
        calculateDifficulties(this)
    }

    deriveSpeed() {
        calculateSpeeds(this.stats.dexterity!, this.speed) // <-- surely, this is fine
    }

    /**
     * TODO: create some feedback on the UI for when fatigue is reducing max slots, maybe make it
     *       red with some on-hover helper text?
     */
    deriveInventoryData() {
        consolidate(this.inventory.coins as CoinValue)
        this.inventory.items.forEach((i) => this.inventory.occupiedSlots! += i.slots!)
        this.inventory.maxSlots = Number(this.stats.might) + 8 + this.inventory.slotBonus! - this.fatigue
    }

}