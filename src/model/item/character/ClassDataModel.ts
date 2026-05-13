import { fields, standardInteger, statOptions } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import PerkDataModel from "./PerkDataModel"
import { skillsTrainingSchema } from "./type/SkillsTraining"
import { spellcastingSchema } from "./type/SpellCasting"

const classSchema = () => {
    return {
        // Heros with spellcasting data are casters. Else, leave it as-is.
        spellcastingData: new fields.SchemaField({ ...spellcastingSchema() }),

        // Key stats for this class meant to help players with point allocation during creation.
        keyStats: new fields.ArrayField(new fields.StringField({ ...statOptions() }), { initial: [] }),
        
        // An array of 10 (MAX_LEVEL) features the class gets each level.
        features: new fields.ArrayField(
            new fields.SchemaField({
                statIncrease: new fields.NumberField({ ...standardInteger }),
                skillsTraining: new fields.SchemaField({ ...skillsTrainingSchema() }),
                spells: new fields.NumberField({ ...standardInteger }),
                perks: new fields.SchemaField({ ...PerkDataModel.defineSchema() })
            })
        )
    }
}

export type ClassSchema = ReturnType<typeof classSchema> & BaseItemSchema

export default class ClassDataModel<T extends ClassSchema> extends ItemDataModel<T> {
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