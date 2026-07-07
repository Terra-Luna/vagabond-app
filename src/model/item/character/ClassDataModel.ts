import { lang } from "../../../utils/lang"
import { fields, optionalString, requiredInteger, requiredString, standardInteger } from "../../common/sharedSchemas"
import { starterPackSchema } from "../equip/StarterPackDataModel"
import {ItemDataModel, BaseItemSchema } from "../ItemDataModel"
import { classFeatureSchema } from "./traitsAndFeatures"

const classSchema = () => {
    return {
        action: new fields.StringField({ ...requiredString }),
        move: new fields.StringField({ ...requiredString }),
        complexity: new fields.NumberField({ ...requiredInteger, min: 1, max: 5, initial: 1}),
        keyStats: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Stat) }), { initial: [] }),
        startingPacks: new fields.ArrayField(new fields.SchemaField({ ...starterPackSchema() })),

        training: new fields.SchemaField({
            weaponTraining: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: ['melee', 'ranged', 'brawl', 'finesse'] }), { initial: [] }),
            requiredTraining: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Skills).filter(it => !['melee', 'ranged', 'brawl', 'finesse'].includes(it)) })),
            electivePoolOptions: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: [...Object.keys(lang.VGLITE.Skills), 'any'] })),
            electiveTrainingCount: new fields.NumberField({ ...requiredInteger, initial: 0 })
        }),

        castingSkill: new fields.StringField({ ...requiredString, choices: ['', ...Object.keys(lang.VGLITE.Skills)], blank: true }),
        maxManaStat: new fields.StringField({ ...requiredString, choices: ['', ...Object.keys(lang.VGLITE.Stat)], blank: true }),
        manaMultiplier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        spellsGained: new fields.NumberField({ ...standardInteger }),
        spellGainInterval: new fields.NumberField({ ...standardInteger }),
        startingSpells: new fields.ArrayField(new fields.StringField({ ...requiredString })),

        features: new fields.ArrayField(new fields.SchemaField({ ...classFeatureSchema() }))
    }
}

export type ClassSchema = ReturnType<typeof classSchema> & BaseItemSchema

export class ClassDataModel extends ItemDataModel<ClassSchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...classSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}