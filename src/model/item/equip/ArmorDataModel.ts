import lang from "../../../../public/lang/en.json"
import HeroDataModel from "../../actor/HeroDataModel"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import EquipmentDataModel, { setEquipState } from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const armorSchema = () => {
    return {
        armorType: new fields.StringField({ reuired: false, initial: 'light', choices: ['light', 'medium', 'heavy'] }),
        rating: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
        mightReq: new fields.NumberField({ ...requiredInteger, initial: 3 }),
        material: new fields.StringField({ ...requiredString, initial: 'Standard', choices: Object.values(lang.VGLITE.Metals).map(it => it.name) })
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

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}

export async function equipArmor(hero: HeroDataModel, armor: ArmorDataModel) {
    const equippedArmor = hero.parent.items.filter((it: any) => it.type === "armor" && it.system.isEquipped)
    equippedArmor.forEach(async (it: any) => {
        console.log("Unequipping armor:", it)
        await setEquipState(it, false)
    })
    console.log("Equipping armor:", armor)
    await setEquipState(armor, true)
}