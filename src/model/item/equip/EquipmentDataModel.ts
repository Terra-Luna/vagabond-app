import { lang } from "../../../utils/lang"
import { addCoins as addCoins, coinSchema, consolidateCoins, multiplyCoins } from "../../common/CoinValue"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

/**
 * Anything a hero can have in their inventory.
 * Subtypes: Armor, Weapon, Alchemical, Tool, Sundry
 */
const baseEquipmentSchema = () => {
    return {
        category: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.EquipmentCategories), initial: 'other' }),
        value: new fields.SchemaField({ ...coinSchema() }),
        totalValue: new fields.SchemaField({ ...coinSchema() }),
        bulk: new fields.SchemaField({
            slots: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            isStackable: new fields.BooleanField({ initial: false }),
            stackSize: new fields.NumberField({ ...requiredInteger, initial: 100 }),
            quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            totalSlots: new fields.NumberField({ ...requiredInteger, initial: 0 })
        }),
        isEquippable: new fields.BooleanField({ initial: false }),
        isEquipped: new fields.BooleanField({ initial: false }),
        isConsumable: new fields.BooleanField({ initial: false }),
        relicEffects: new fields.ArrayField(
            new fields.SchemaField({
                type: new fields.StringField({
                    ...requiredString, choices: [
                        'BONUS', 'CURSED', 'PROTECTION', 'MOVEMENT', 'SENSES', 'UTILITY', 'UNIQUE', 'FABLED'
                    ]
                }),
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
        if ((this as any).material) {
            const baseValue = this.value
            this.value = multiplyCoins(baseValue, lang.VGLITE.Metals[(this as any).material].valueMultiplier)
        }
        if (this.relicEffects.length > 0) {
            this.value = addCoins(this.relicEffects.flatMap(it => it.addedCoinValue))
        }
        this.totalValue = multiplyCoins(this.value, Math.max(1, this.bulk.quantity))
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        if (this.bulk.isStackable) {
            this.bulk.totalSlots = getStackSlots(this as EquipmentDataModel<any>)
        }
        else {
            this.bulk.totalSlots = this.bulk.slots
        }
    }

    override async _preUpdate(changes, options, user) {
        await super._preUpdate(changes, options, user)
        const coinChanges = (changes.system as any)?.value
        if (coinChanges !== undefined) {
            const { g, s, c } = this.value
            const newG = coinChanges.g ?? g
            const newS = coinChanges.s ?? s
            const newC = coinChanges.c ?? c;
            (changes.system as any).value = consolidateCoins({ g: newG, s: newS, c: newC })
        }
    }

    override async _onDelete(options: any, userId: string): Promise<void> {
        await super._onDelete(options, userId)
        /**
         * Check PC's containers and cleanup the deleted item's ID.
         */
        if (game.user?.id === userId) {
            const containers = this.parent.actor.items.filter(i =>
                i.type === 'container' && i.system.itemIds.includes(this.parent.id)
            )
            for (const container of containers) {
                const itemIds = container.system.itemIds ?? []
                await container.update({ 'system.itemIds': itemIds.filter(id => id !== this.parent.id) })
            }
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

export const getStackSlots = (stack: EquipmentDataModel<EquipmentSchema>): number => {
    const slots = stack.bulk.slots ?? 0
    const qty = stack.bulk.quantity ?? 0
    return slots > 0 ? qty * slots : Math.floor(qty / stack.bulk.stackSize)
}