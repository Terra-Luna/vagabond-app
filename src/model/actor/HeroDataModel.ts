import { fields, requiredInteger } from "../common/sharedSchemas"
import AncestryDataModel from "../item/character/AncestryDataModel"
import ClassDataModel from "../item/character/ClassDataModel"
import { perksSchema, setPerkSlots } from "../item/character/PerkDataModel"
import { setSpellcasting as setSpellcasting } from "../item/character/type/SpellCasting"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { setArmorRating } from "./type/Armor"
import { bonusSchema } from "./type/Bonus"
import { setMaxHP, validateCurrentHP } from "./type/Health"
import { inventorySchema,setInventoryData } from "./type/Inventory"
import { levelSchema, setXpToNextLevel } from "./type/Level"
import { manaSchema,setManaValues } from "./type/Mana"
import { savesSchema,setSaves } from "./type/Saves"
import { setSenses } from "./type/Senses"
import { setDifficulties as setSkillDifficulties, skillsSchema } from "./type/Skills"
import { setSpeeds, speedSchema } from "./type/Speed"
import { applyStatBonuses, statsSchema } from "./type/Stats"

const heroSchema = () => {
    return {
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        bonus: new fields.SchemaField({ ...bonusSchema() }),
        boundRelicLimit: new fields.NumberField({ integer: true, initial: 3 }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        fatigue: new fields.NumberField({ choices: [0, 1, 2, 3, 4, 5], initial: 0, max: 5 }),
        inventory: new fields.SchemaField({ ...inventorySchema() }),
        level: new fields.SchemaField({ ...levelSchema() }),
        mana: new fields.SchemaField({ ...manaSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        perkData: new fields.SchemaField({ ...perksSchema() }),
        stats: new fields.SchemaField({ ...statsSchema() }),
        studied: new fields.NumberField({ ...requiredInteger, initial: 0 })
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

    override _initialize() {
        super._initialize()
        this.health.current = 2
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        applyStatBonuses(this)
        setXpToNextLevel(this)
        setMaxHP(this)
        validateCurrentHP(this)
        setArmorRating(this)
        setSaves(this)
        setManaValues(this)
        setSkillDifficulties(this)
        setSpeeds(this)
        setSenses(this)
        setSpellcasting(this)
        setInventoryData(this)
        setPerkSlots(this)
    }

    async updateStudied(changeBy: number) {
        this.studied! += changeBy
    }

    async updateFatigue(changeBy: number) {
        this.fatigue += changeBy
        if (this.fatigue == 5) {
            this.health.current = 0
        }
    }

}