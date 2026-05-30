import HeroDataModel from "../../actor/HeroDataModel"
import { addCoins, coinSchema } from "../../common/CoinValue"
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

export const applyStarterPack = (hero: HeroDataModel, pack: StarterPackDataModel) => {
    pack.items.forEach(it => {
        hero.inventory.container.items.push(it)
    })
    hero.inventory.coins = addCoins([hero.inventory.coins, pack.coins])
}