import { lang } from "../../../utils/lang"
import { addCoins as addCoins, Coins, coinSchema, consolidateCoins, multiplyCoins, toCopper } from "../../common/CoinValue"
import { fields, optionalString, requiredInteger, requiredString } from "../../common/sharedSchemas"
import {BaseItemSchema,ItemDataModel } from "../ItemDataModel"

/**
 * Anything a hero can have in their inventory.
 * Subtypes: Armor, Weapon, Alchemical, Tool, Sundry
 */
const baseEquipmentSchema = () => {
    return {
        category: new fields.StringField({ ...requiredString, choices: Object.keys(lang.APP.EquipmentCategories), initial: 'other' }),
        value: new fields.SchemaField({ ...coinSchema() }),
        copperValue: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bulk: new fields.SchemaField({
            slots: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            isStackable: new fields.BooleanField({ initial: false }),
            stackSize: new fields.NumberField({ ...requiredInteger, initial: 10 }),
            quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            totalSlots: new fields.NumberField({ ...requiredInteger, initial: 0 })
        }),
        isEquippable: new fields.BooleanField({ initial: false }),
        isEquipped: new fields.BooleanField({ initial: false }),
        isConsumable: new fields.BooleanField({ initial: false }),
        relicPowers: new fields.ArrayField(
            new fields.SchemaField({
                id: new fields.StringField({ ...requiredString }),
                category: new fields.SchemaField({
                    value: new fields.StringField({ ...requiredString }),
                    label: new fields.StringField({ ...requiredString })
                }),
                power: new fields.SchemaField({
                    value: new fields.StringField({ ...requiredString }),
                    label: new fields.StringField({ ...requiredString }),
                    modifiers: new fields.ArrayField(
                        new fields.SchemaField({
                            path: new fields.StringField({ ...requiredString }),
                            value: new fields.NumberField({ ...requiredInteger })
                        }),
                        { initial: [] }
                    )
                }),
                goldValue: new fields.NumberField({ ...requiredInteger }),
                bound: new fields.BooleanField({ initial: false }),
                description: new fields.StringField({ ...optionalString })
            }),
            { initial: [] }
        )
    }
}

export type EquipmentSchema = ReturnType<typeof baseEquipmentSchema> & BaseItemSchema

export abstract class EquipmentDataModel<T extends EquipmentSchema> extends ItemDataModel<T> {
    declare isEquippable: boolean
    declare isEquipped: boolean
    declare totalValue: Coins

    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...baseEquipmentSchema()
        }
    }

    /**
     * The purpose of this is to ensure when an item is dragged from one place to another
     * that its total copper value is serialized. This is, mostly, a patch for a bug within
     * Item Piles where it can't otherwise recognize item values for use with Merchants.
     * @param data 
     * @param options 
     * @param user 
     * @returns 
     */ 
    override async _preCreate(data: any, options: any, user: any) {
        const result = await super._preCreate(data, options, user)
        const totalCopper = toCopper(data.system?.value ?? { g: 0, s: 0, c: 0 })
        this.parent.updateSource({ "system.copperValue": totalCopper })
        return result
    }

    override prepareBaseData() {
        super.prepareBaseData()
        if ((this as any).material) {
            const baseValue = this.value
            this.value = multiplyCoins(baseValue, lang.APP.Metals[(this as any).material].valueMultiplier)
        }
        if (this.relicPowers.length > 0) {
            this.value = addCoins(this.relicPowers.flatMap(power => (
                { g: power.goldValue ?? 0, s: 0, c: 0 }
            )))
        }
        this.totalValue = multiplyCoins(this.value, Math.max(1, this.bulk.quantity))
    }

    override prepareDerivedData() {
        super.prepareDerivedData()
        this.bulk.totalSlots = getTotalSlots(this)
        this.copperValue = toCopper((this as any)?.value ?? { g: 0, s: 0, c: 0 })
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
            const containers = this.parent?.actor?.items?.filter(i =>
                i.type === 'container' && i.system.itemIds.includes(this.parent.id)
            ) ?? []
            for (const container of containers) {
                const itemIds = container.system.itemIds ?? []
                await container.update({ 'system.itemIds': itemIds.filter(id => id !== this.parent.id) })
            }
        }
    }

}

export const setEquipState = async (item: any, isEquipped: boolean) => {
    if (item?.system) {
        if (item.system.isEquippable && item.system.isEquipped != isEquipped) {
            await item.update({ 'system.isEquipped': isEquipped })
        }
    }
    else if (item) {
        if (item.isEquippable && item.isEquipped != isEquipped) {
            await item.parent.update({ 'system.isEquipped': isEquipped })
        }
    }
}

export const getTotalSlots = (item: any): number => {
    if (item?.bulk?.isStackable) {
        return getStackSlots(item)
    }
    else {
        return item?.bulk?.slots ?? 0
    }
}

export const getStackSlots = (stack: EquipmentDataModel<EquipmentSchema>): number => {
    const slots = stack.bulk.slots ?? 0
    const qty = stack.bulk.quantity ?? 0
    return slots > 0 ? qty * slots : Math.floor(qty / stack.bulk.stackSize)
}