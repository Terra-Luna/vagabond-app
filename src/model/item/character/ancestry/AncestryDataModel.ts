import { beingSizeOptions, beingTypeOptions } from "../../../actor/attribute/beingTraitsSchema"
import { fields } from "../../../foundryHelper"
import ItemDataModel, { BaseItemSchema } from "../../ItemDataModel"
import AncestryTraitDataModel from "./AncestryTraitDataModel"

const ancestrySchema = () => {
    return {
        beingType: new fields.StringField({ ...beingTypeOptions() }),
        beingSize: new fields.StringField({ ...beingSizeOptions() }),
        
        /**
         * Bonuses granted by the selected ancestry such as: +1 stat,
         * extra perk, extra training, etc...
         */
        traits: new fields.ArrayField(
            new fields.SchemaField({ ...AncestryTraitDataModel.defineSchema() })
        )
    }
}

export type AncestrySchema = ReturnType<typeof ancestrySchema> & BaseItemSchema

export default class AncestryDataModel<T extends AncestrySchema> extends ItemDataModel<T> {
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