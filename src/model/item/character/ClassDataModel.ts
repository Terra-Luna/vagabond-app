import lang from "../../../../public/lang/en.json"
import { fields, optionalString, requiredInteger, requiredString, standardInteger, statOptions } from "../../common/sharedSchemas"
import { starterPackSchema } from "../equip/StarterPackDataModel"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import { classFeatureSchema } from "./traitsAndFeatures"

const classSchema = () => {
    return {
        action: new fields.StringField({ ...requiredString }),
        move: new fields.StringField({ ...requiredString }),
        complexity: new fields.NumberField({ ...requiredInteger, min: 1, max: 5}),
        icons: new fields.ArrayField(new fields.StringField({ ...requiredString })),
        playstyle: new fields.StringField({ ...requiredString }),
        keyStats: new fields.ArrayField(new fields.StringField({ ...statOptions() }), { initial: [] }),
        startingPacks: new fields.ArrayField(new fields.SchemaField({ ...starterPackSchema() })),

        requiredTraining: new fields.ArrayField(new fields.StringField({ ...requiredString, options: Object.values(lang.VGLITE.Skills) })),
        electiveTrainingCount: new fields.NumberField({ ...requiredInteger }),
        electivePoolOptions: new fields.ArrayField(new fields.StringField({ ...requiredString, options: Object.values(lang.VGLITE.Skills)} )),

        castingSkill: new fields.StringField({ ...optionalString, options: Object.values(lang.VGLITE.Skills).map(it => it.name)}),
        maxManaStat: new fields.StringField({ ...optionalString, options: Object.values(lang.VGLITE.Stat).map(it => it.long)}),
        manaMultiplier: new fields.NumberField({ ...standardInteger }),
        spellsGained: new fields.NumberField({ ...standardInteger }),
        spellGainInterval: new fields.NumberField({ ...standardInteger }),
        startingSpells: new fields.ArrayField(new fields.StringField({ ...requiredString })),

        features: new fields.ArrayField(new fields.SchemaField({ ...classFeatureSchema() }))
    }
}

export type ClassSchema = ReturnType<typeof classSchema> & BaseItemSchema

export default class ClassDataModel extends ItemDataModel<ClassSchema> {
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