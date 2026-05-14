import { fields, requiredInteger } from "../common/sharedSchemas"
import AncestryDataModel from "../item/character/AncestryDataModel"
import ClassDataModel from "../item/character/ClassDataModel"
import { setSpellcastingData } from "../item/character/type/SpellCasting"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { setMaxHP } from "./type/Health"
import { inventorySchema,setInventoryData } from "./type/Inventory"
import { levelSchema, setXpToNextLevel } from "./type/Level"
import { manaSchema,setManaValues } from "./type/Mana"
import { savesSchema,setSaves } from "./type/Saves"
import { setSenses } from "./type/Senses"
import { setDifficulties as setSkillDifficulties, skillsSchema } from "./type/Skills"
import { setSpeeds, Speed, speedSchema } from "./type/Speed"
import { statsSchema } from "./type/Stats"

const heroSchema = () => {
    return {
        level: new fields.SchemaField({ ...levelSchema() }),
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        stats: new fields.SchemaField({ ...statsSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        mana: new fields.SchemaField({ ...manaSchema() }),
        inventory: new fields.SchemaField({ ...inventorySchema() }),
        studied: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        fatigue: new fields.NumberField({ choices: [0, 1, 2, 3, 4, 5], initial: 0, max: 5 }),
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
        setXpToNextLevel(this)
        setMaxHP(this)
        setSaves(this)
        setManaValues(this)
        setSkillDifficulties(this)
        setSpeeds(this)
        setInventoryData(this)
        setSenses(this)
        setSpellcastingData(this)
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