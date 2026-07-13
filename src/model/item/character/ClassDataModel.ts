import { lang } from "../../../utils/lang"
import { fields, requiredInteger, requiredString, standardInteger } from "../../common/sharedSchemas"
import { starterPackSchema } from "../equip/StarterPackDataModel"
import {ItemDataModel, BaseItemSchema } from "../ItemDataModel"

const classSchema = () => {
    return {
        action: new fields.StringField({ ...requiredString }),
        move: new fields.StringField({ ...requiredString }),
        complexity: new fields.NumberField({ ...requiredInteger, min: 1, max: 5, initial: 1}),
        keyStats: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Stat) }), { initial: [] }),
        startingPacks: new fields.ArrayField(new fields.SchemaField({ ...starterPackSchema() })),
        castingSkill: new fields.StringField({ ...requiredString, choices: ['', ...Object.keys(lang.VGLITE.Skills)], blank: true }),
        maxManaStat: new fields.StringField({ ...requiredString, choices: ['', ...Object.keys(lang.VGLITE.Stat)], blank: true }),
        manaMultiplier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        initialSpellSlots: new fields.NumberField({ ...standardInteger, initial: 0 }),
        spellGainInterval: new fields.NumberField({ ...standardInteger, initial: 0 }),
        features: new fields.ArrayField(new fields.SchemaField({
            level: new fields.NumberField({ ...requiredInteger }),
            name: new fields.StringField({ ...requiredString }),
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