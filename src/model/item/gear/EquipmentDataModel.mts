import HeroDataModel from "../../actor/HeroDataModel.mjs";
import CurrencyDataModel from "../CurrencyDataModel.mjs";
import ItemBase, { BaseItemSchema } from "../ItemBase.mjs";

const baseEquipmentSchema = () => {
    const f = foundry.data.fields
    return {
        value: new f.SchemaField({ ...CurrencyDataModel.defineSchema() }),
        slots: new f.NumberField({ integer: true, min: 0, max: 4 }),
        isEquipped: new f.BooleanField({ initial: false }),
        relicData: new f.SchemaField({
            isRelic: new f.BooleanField({ initial: false }),
            requiresBind: new f.BooleanField({ initial: false }),
            isBound: new f.BooleanField({ initial: false })
        })
    }
}

export type EquipmentSchema = ReturnType<typeof baseEquipmentSchema> & BaseItemSchema

export default abstract class EquipmentDataModel<T extends EquipmentSchema> extends ItemBase<T> {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...super.defineSchema(),
            ...baseEquipmentSchema()
        }
    }

    abstract onEquip(hero: HeroDataModel)
    abstract onUse()
}