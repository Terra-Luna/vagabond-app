import { lang } from "../../../utils/lang"
import HeroDataModel from "../../actor/HeroDataModel"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel, { setEquipState } from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const armorSchema = () => {
    return {
        armorType: new fields.StringField({ reuired: false, initial: 'medium', choices: Object.keys(lang.VGLITE.ArmorTypes) }),
        rating: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
        mightReq: new fields.NumberField({ ...requiredInteger, initial: 3 }),
        material: new fields.StringField({ ...requiredString, initial: 'standard', choices: Object.keys(lang.VGLITE.Metals) })
    }
}

export type ArmorSchema = ReturnType<typeof armorSchema> & EquipmentSchema

export default class ArmorDataModel extends EquipmentDataModel<ArmorSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...armorSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'armor'
        })
    }

    override async prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
        this.bulk.isStackable = false
    }
}

export async function equipArmor(hero: HeroDataModel, armor: ArmorDataModel) {
    const equippedArmor = hero.parent.items.filter((it: any) => it.type === "armor" && it.system.isEquipped)
    equippedArmor.forEach(async (it: any) => {
        await setEquipState(it, false)
    })
    await setEquipState(armor, true)
}