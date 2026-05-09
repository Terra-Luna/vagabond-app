import { HeroDataModel } from "../../actor/HeroDataModel.mjs"
import EquipmentDataModel from "./EquipmentDataModel.mjs"
import { EquipmentSchema } from "./EquipmentDataModel.mjs"

const armorSchema = () => {
    const f = foundry.data.fields
    return {
        armorType: new f.StringField({ reuired: false, initial: 'light', choices: ['light', 'medium', 'heavy'] }),
        baseArmor: new f.NumberField({ integer: true, min: 0, initial: 0 })
    }
}

export type ArmorSchema = ReturnType<typeof armorSchema> & EquipmentSchema

export class ArmorDataModel extends EquipmentDataModel<ArmorSchema> {
    static defineSchema() {
        const f = foundry.data.fields
        return {
            ...super.defineSchema(),
            ...armorSchema()
        }
    }

    prepareDerivedData() {
        super.prepareDerivedData()
        this.baseArmor = { 'light': 1, 'medium': 2, 'heavy': 3 }[this.armorType || 0]
    }

    onEquip(hero: HeroDataModel) {
        
    }

    onUse() { }
}