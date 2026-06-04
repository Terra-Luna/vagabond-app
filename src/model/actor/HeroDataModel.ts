import { fields, optionalString, requiredInteger, requiredString } from "../common/sharedSchemas"
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
import lang from "../../../public/lang/en.json"
import AncestryDataModel from "../item/character/AncestryDataModel"

const heroSchema = () => {
    return {
        tagalongId: new fields.StringField({ ...optionalString }),
        level: new fields.SchemaField({ ...levelSchema() }),
        stats: new fields.SchemaField({ ...statsSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        studied: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        fatigue: new fields.NumberField({ ...requiredInteger, initial: 0, max: 5 }),
        mana: new fields.SchemaField({ ...manaSchema() }),
        boundRelicLimit: new fields.NumberField({ integer: true, initial: 3 }),
        bonus: new fields.SchemaField({ ...heroBonusSchema() }),
        inventory: new fields.SchemaField({ ...inventorySchema() }),
        traits: new fields.ArrayField(new fields.SchemaField({ ...traitSchema() })),
        actions: new fields.ArrayField(
            new fields.StringField(
                { ...requiredString, options: Object.values(lang.VGLITE.Skills).map(it => it.name) }
            ), { initial: ['Melee', 'Ranged'], max: 2 }
        ),

        /**
         * Derived from embedded documents...
         */
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        perks: new fields.ArrayField(new fields.SchemaField({ ...PerkDataModel.defineSchema() })),
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
        console.log("HeroDataModel#preparDerivedData()")
        super.prepareDerivedData()
        this.ancestry = this.parent.items.find(i => i.type === 'ancestry')?.system
        this.class = this.parent.items.find(i => i.type === 'class')?.system
        this.perks = this.parent.items.filter(i => i.type === 'perk')?.map(it => it.system)
        this.spells = this.parent.items.filter(i => i.type === 'spell')?.map(it => it.system)
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

export function getSkillByName(hero: HeroDataModel, skillName: string): { name: string, value: number, isTrained: boolean } {
    const skill = hero.skills[skillName.toLowerCase()]
    return { name: skillName, value: skill.value, isTrained: skill.isTrained }
}