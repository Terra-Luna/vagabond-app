import { fields, requiredInteger, requiredString, statOptions } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import { classFeatureSchema } from "./FeatureDataModel"
import { skillsTrainingSchema } from "./type/SkillsTraining"
import { spellcastingSchema } from "./type/SpellCasting"

const classSchema = () => {
    return {
        // Heros with spellcasting data are casters. Else, leave it as default.
        spellcasting: new fields.SchemaField({ ...spellcastingSchema() }),

        // Key stats for this class meant to help players with point allocation during creation.
        keyStats: new fields.ArrayField(new fields.StringField({ ...statOptions() }), { initial: [] }),
        
        // Training this class gets at hero creation.
        training: new fields.SchemaField({ ...skillsTrainingSchema() }),

        // An array of 10 (MAX_LEVEL) feature sets the class gets each level.
        levelFeatures: new fields.ArrayField(
            new fields.SchemaField({
                level: new fields.NumberField({ ...requiredInteger, max: 10 }),
                features: new fields.ArrayField(new fields.SchemaField({ ...classFeatureSchema() }))
            })
        )
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