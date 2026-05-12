import { fields } from "../../../common/sharedSchemas"
import WealthDataModel from "../../actor/attribute/WealthDataModel"
import HeroDataModel from "../../actor/HeroDataModel"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const baseEquipmentSchema = () => {
    return {
        value: new fields.SchemaField({ ...WealthDataModel.defineSchema() }),
        slots: new fields.NumberField({ integer: true, min: 0, max: 4 }),
        isEquipped: new fields.BooleanField({ initial: false }),
        relicData: new fields.SchemaField({
            isRelic: new fields.BooleanField({ initial: false }),
            requiresBind: new fields.BooleanField({ initial: false }),
            isBound: new fields.BooleanField({ initial: false })
        })
    }
}

export type EquipmentSchema = ReturnType<typeof baseEquipmentSchema> & BaseItemSchema

export default abstract class EquipmentDataModel<T extends EquipmentSchema> extends ItemDataModel<T> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...baseEquipmentSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }

    abstract onEquip(hero: HeroDataModel)
    abstract onUse()
}