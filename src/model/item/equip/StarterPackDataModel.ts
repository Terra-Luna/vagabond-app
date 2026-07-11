import { coinSchema } from "../../common/CoinValue"
import { fields } from "../../common/sharedSchemas"
import { ItemDataModel, BaseItemSchema } from "../ItemDataModel"
import { EquipmentDataModel } from "./EquipmentDataModel"

export const starterPackSchema = () => {
    return {
        items: new fields.ArrayField(new fields.SchemaField({ ...EquipmentDataModel.defineSchema() })),
        coins: new fields.SchemaField({ ...coinSchema() })
    }
}

export type StarterPackSchema = ReturnType<typeof starterPackSchema> & BaseItemSchema

export class StarterPackDataModel extends ItemDataModel<StarterPackSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...starterPackSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'containers'
        })
    }
}