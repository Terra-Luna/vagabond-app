import { HeroDataModel } from "../../actor/Hero.mjs";
import Currency from "../Currency.mjs";
import ItemBase from "../ItemBase.mjs";

export default abstract class EquipmentDataModel extends ItemBase {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...super.defineSchema({
                value: new f.SchemaField({
                    ...Currency.defineSchema()
                }),
                slots: new f.NumberField({ integer: true, min: 0, max: 4 })
            }),
            isEquipped: new f.BooleanField({ initial: false }),
            relicData: new f.SchemaField({
                isRelic: new f.BooleanField({ initial: false }),
                requiresBind: new f.BooleanField({ initial: false }),
                isBound: new f.BooleanField({ initial: false })
            })
        }
    }

    abstract onEquip(hero: HeroDataModel)
    abstract onUse()
}