import { fields, requiredInteger } from "../common/sharedSchemas"
import AncestryDataModel from "../item/character/AncestryDataModel"
import ClassDataModel from "../item/character/ClassDataModel"
import PerkDataModel from "../item/character/PerkDataModel"
import SpellDataModel from "../item/character/SpellDataModel"
import { traitSchema } from "../item/character/traitsAndFeatures"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { setArmorRating } from "./type/Armor"
import { heroBonusSchema } from "./type/Bonus"
import { setMaxHP, validateCurrentHP } from "./type/Health"
import { inventorySchema, setInventoryData } from "./type/Inventory"
import { levelSchema, setXpToNextLevel } from "./type/Level"
import { manaSchema, setManaValues } from "./type/Mana"
import { savesSchema, setSaves } from "./type/Saves"
import { setSenses } from "./type/Senses"
import { setDifficulties as setSkillDifficulties, skillsSchema } from "./type/Skills"
import { setSpeeds, speedSchema } from "./type/Speed"
import { applyStatBonuses, statsSchema, validateCurrentLuck } from "./type/Stats"

const heroSchema = () => {
    return {
        level: new fields.SchemaField({ ...levelSchema() }),
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),

        stats: new fields.SchemaField({ ...statsSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        studied: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        fatigue: new fields.NumberField({ ...requiredInteger, initial: 0, max: 5 }),
        boundRelicLimit: new fields.NumberField({ integer: true, initial: 3 }),
        bonus: new fields.SchemaField({ ...heroBonusSchema() }),

        inventory: new fields.SchemaField({ ...inventorySchema() }),

        traits: new fields.ArrayField(new fields.SchemaField({ ...traitSchema() })),
        perks: new fields.ArrayField(new fields.SchemaField({ ...PerkDataModel.defineSchema() })),

        mana: new fields.SchemaField({ ...manaSchema() }),
        spells: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() }))
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

    override async _onCreate(data: any, options: any, userId: string) {
        console.log("Creating Hero:", this)
        this.health.current = 2
        super._onCreate(data, options, userId)
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        applyStatBonuses(this)
        setXpToNextLevel(this)
        setMaxHP(this)
        validateCurrentHP(this)
        validateCurrentLuck(this)
        setArmorRating(this)
        setSaves(this)
        setManaValues(this)
        setSkillDifficulties(this)
        setSpeeds(this)
        setSenses(this)
        setInventoryData(this)
    }

}