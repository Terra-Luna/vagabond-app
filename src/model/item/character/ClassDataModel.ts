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
        icons: new fields.ArrayField(new fields.StringField({ ...requiredString })),
        playstyle: new fields.StringField({ ...requiredString }),
        keyStats: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Stat) }), { initial: [] }),
        startingPacks: new fields.ArrayField(new fields.SchemaField({ ...starterPackSchema() })),

        requiredTraining: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Skills) })),
        electiveTrainingCount: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        electivePoolOptions: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Skills) })),

        castingSkill: new fields.StringField({ ...optionalString, choices: Object.keys(lang.VGLITE.Skills) }),
        maxManaStat: new fields.StringField({ ...optionalString, choices: Object.keys(lang.VGLITE.Stat) }),
        manaMultiplier: new fields.NumberField({ ...standardInteger }),
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