import { sensesSchema } from "../../actor/type/Senses"
import { beingSizeOptions, beingTypeOptions, fields } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import { grantSchema,traitSchema } from "./traitsAndFeatures"

const ancestrySchema = () => {
    return {
        senses: new fields.ArrayField(new fields.SchemaField({ ...sensesSchema() }), { initial: [] }),
        beingType: new fields.StringField({ ...beingTypeOptions() }),
        beingSize: new fields.StringField({ ...beingSizeOptions() }),
        traits: new fields.ArrayField(new fields.SchemaField({ ...traitSchema() })),
        grants: new fields.ArrayField(new fields.SchemaField({ ...grantSchema() }))
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