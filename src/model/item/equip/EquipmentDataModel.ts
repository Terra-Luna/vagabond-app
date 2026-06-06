import lang from "../../../../public/lang/en.json"
import { itemBonusSchema } from "../../actor/type/Bonus"
import { addCoins as addCoins, coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

/**
 * Anything a hero can have in their inventory.
 * Subtypes: Armor, Weapon, Alchemical, Tool, Sundry
 */
const baseEquipmentSchema = () => {
    return {
        value: new fields.SchemaField({ ...coinSchema() }),
        slots: new fields.NumberField({ integer: true, min: 0 }),
        quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        isStackable: new fields.BooleanField({ initial: false }),
        isEquippable: new fields.BooleanField({ initial: false }),
        isEquipped: new fields.BooleanField({ initial: false }),
        category: new fields.StringField({ ...requiredString, options: Object.values(lang.VGLITE.EquipmentCategories) }),
        relicEffects: new fields.ArrayField(
            new fields.SchemaField({
                type: new fields.StringField({ ...requiredString, choices: ['BONUS', 'CURSED', 'PROTECTION', 'MOVEMENT', 'SENSES', 'UTILITY', 'UNIQUE', 'UTILITY', 'FABLED'] }),
                power: new fields.SchemaField({}),
                addedCoinValue: new fields.SchemaField({ ...coinSchema() })
            })
        ),

        /**
         * Derived
         */
        bonus: new fields.SchemaField({ ...itemBonusSchema() }),
        isEquippedWeaponOrShield: new fields.BooleanField({ initial: false }),
        isEquippedArmor: new fields.BooleanField({ initial: false })
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
        this.slots = this.slots! + this.bonus.slots!
        if (this.relicEffects.length > 0) {
            this.value = addCoins(this.relicEffects.flatMap(it => it.addedCoinValue))
        }
        this.isEquippedWeaponOrShield = this.isEquipped && this.parent.type === 'weapon'
        this.isEquippedArmor = this.isEquipped && this.parent.type === 'armor'
    }
}