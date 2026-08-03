import { lang } from "../../../utils/lang"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { EquipmentDataModel } from "./EquipmentDataModel"
import { EquipmentSchema } from "./EquipmentDataModel"

const armorSchema = () => {
    return {
        armorType: new fields.StringField({ reuired: false, initial: 'medium', choices: Object.keys(lang.VGLITE.ArmorTypes) }),
        rating: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
        mightReq: new fields.NumberField({ ...requiredInteger, initial: 3 }),
        material: new fields.StringField({ ...requiredString, initial: 'steel', choices: Object.keys(lang.VGLITE.Metals) })
    }
}

export type ArmorSchema = ReturnType<typeof armorSchema> & EquipmentSchema

export class ArmorDataModel extends EquipmentDataModel<ArmorSchema> {
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

    override prepareBaseData() {
        super.prepareBaseData()
        this.isEquippable = true
        this.bulk.isStackable = false
    }
}