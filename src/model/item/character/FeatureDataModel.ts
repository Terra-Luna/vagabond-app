import { fields } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

export const featureSchema = () => {
    return {
        x: new fields.StringField()
    }
}

export type FeatureSchema = ReturnType<typeof featureSchema> & BaseItemSchema

export default class FeatureDataModel<T extends FeatureSchema> extends ItemDataModel<T> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...featureSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}