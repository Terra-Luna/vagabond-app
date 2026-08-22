import { lang } from "../../../utils/lang"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import {BaseItemSchema,ItemDataModel } from "../ItemDataModel"

const classSchema = () => {
    return {
        complexity: new fields.NumberField({ ...requiredInteger, min: 1, max: 5, initial: 1}),
        keyStats: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Stat) }), { initial: [] }),
        startingPacks: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
        castingSkill: new fields.StringField({ ...requiredString, choices: ['', ...Object.keys(lang.VGLITE.Skills)], blank: true }),
        manaMultiplier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        maxCastFormula: new fields.StringField({ ...requiredString, choices: ['', "half", 'full'], blank: true }),
        features: new fields.ArrayField(new fields.SchemaField({
            name: new fields.StringField({ ...requiredString }),
            level: new fields.NumberField({ ...requiredInteger }),
            scale: new fields.NumberField({ ...requiredInteger }),
            description: new fields.HTMLField({ ...requiredString })
        }))
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
}