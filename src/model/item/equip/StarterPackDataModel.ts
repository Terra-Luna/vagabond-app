import lang from "../../../../public/lang/en.json"
import HeroDataModel from "../../actor/HeroDataModel"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredString } from "../../common/sharedSchemas"
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

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'container',
            'system.isConsumable': false,
            'system.bulk.stackSize': 1
        })
    }
}

export const applyStarterPack = async (hero: HeroDataModel, pack: StarterPackDataModel) => {
    await hero.parent.createEmbeddedDocuments("Item", [pack.items])
}