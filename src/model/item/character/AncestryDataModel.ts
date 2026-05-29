import { sensesSchema } from "../../actor/type/Senses"
import { beingSizeOptions, beingTypeOptions, fields, optionalString, requiredString, standardInteger } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import SpellDataModel from "./SpellDataModel"
import { skillsTrainingSchema } from "./type/SkillsTraining"

const ancestrySchema = () => {
    return {
        senses: new fields.ArrayField(new fields.SchemaField({ ...sensesSchema() }), { initial: [] }),
        beingType: new fields.StringField({ ...beingTypeOptions() }),
        beingSize: new fields.StringField({ ...beingSizeOptions() }),
        // The training this ancestry received at hero creation.
        training: new fields.SchemaField({ ...skillsTrainingSchema() }),
        spellcasting: new fields.SchemaField({
            spellSlots: new fields.NumberField({ ...standardInteger }),
            spells: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() })),
            skillOfChoice: new fields.StringField({ ...optionalString })
        })
    }
}

export type AncestrySchema = ReturnType<typeof ancestrySchema> & BaseItemSchema

export default class AncestryDataModel extends ItemDataModel<AncestrySchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...ancestrySchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}