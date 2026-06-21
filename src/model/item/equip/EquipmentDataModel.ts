import lang from "../../../../public/lang/en.json"
import { addCoins as addCoins, coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import { equipArmor } from "./ArmorDataModel"

/**
 * Anything a hero can have in their inventory.
 * Subtypes: Armor, Weapon, Alchemical, Tool, Sundry
 */
const baseEquipmentSchema = () => {
    return {
        category: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.EquipmentCategories) }),
        value: new fields.SchemaField({ ...coinSchema() }),
        slots: new fields.NumberField({ integer: true, min: 0 }),
        quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        isStackable: new fields.BooleanField({ initial: false }),
        isEquippable: new fields.BooleanField({ initial: false }),
        isEquipped: new fields.BooleanField({ initial: false }),
        isConsumable: new fields.BooleanField({ initial: false }),
        relicEffects: new fields.ArrayField(
            new fields.SchemaField({
                type: new fields.StringField({ ...requiredString, choices: ['BONUS', 'CURSED', 'PROTECTION', 'MOVEMENT', 'SENSES', 'UTILITY', 'UNIQUE', 'FABLED'] }),
                power: new fields.SchemaField({}),
                addedCoinValue: new fields.SchemaField({ ...coinSchema() })
            })
        )
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

    override async prepareBaseData() {
        super.prepareBaseData()
        if (this.relicEffects.length > 0) {
            this.value = addCoins(this.relicEffects.flatMap(it => it.addedCoinValue))
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        if (this.isStackable) {
            this.slots = this.quantity! * this.slots!
        }
    }
}

export const setEquipState = async (item: any, isEquipped: boolean) => {
    if (item.system !== undefined) {
        if (item.system.isEquippable && item.system.isEquipped != isEquipped) {
            await item.update({ 'system.isEquipped': isEquipped })
        }
    }
    else {
        if (item.isEquippable && item.isEquipped != isEquipped) {
            await item.parent.update({ 'system.isEquipped': isEquipped })
        }
    }
}