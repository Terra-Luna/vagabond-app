import lang from "../../../../public/lang/en.json"
import HeroDataModel from "../../actor/HeroDataModel"
import { coinSchema } from "../../common/CoinValue"
import { fields, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import EquipmentDataModel from "./EquipmentDataModel"

export const starterPackSchema = () => {
    return {
        category: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.EquipmentCategories), initial: 'other' }),
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

export const applyStarterPack = async (hero: HeroDataModel, pack: StarterPackDataModel) => {
    await hero.parent.createEmbeddedDocuments("Item", [pack.items])
}