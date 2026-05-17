import { coinSchema } from "../../common/CoinValue"
import { fields } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import EquipmentDataModel from "./EquipmentDataModel"

export const starterPackSchema = () => {
    return {
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() })),
        coins: new fields.SchemaField({ ...coinSchema() })
    }
}

export type StarterPackSchema = ReturnType<typeof starterPackSchema> & BaseItemSchema

export default class StarterPackDataModel extends ItemDataModel<StarterPackSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...starterPackSchema()
        }
    }
}