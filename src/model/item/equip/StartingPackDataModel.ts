import { ItemsCache } from "../../../rules/util/ItemsCache"
import { groupBy } from "../../../utils/collectionUtil"
import { stackStackables } from "../../../utils/heroInventoryUtil"
import { getFullItem } from "../../../utils/modelUtil"
import { Coins, coinSchema, subtractCoins } from "../../common/CoinValue"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { BaseItemSchema,ItemDataModel } from "../ItemDataModel"

export const startingPackSchema = () => {
    return {
        items: new fields.ArrayField(new fields.SchemaField({
            id: new fields.StringField({ ...requiredString }),
            name: new fields.StringField({ ...requiredString }),
            qty: new fields.NumberField({ ...requiredInteger, initial: 1 })
        }), { initial: [] }),
        category: new fields.StringField({ ...requiredString, initial: 'containers' }),
        value: new fields.SchemaField({ ...coinSchema() })
    }
}

export type StartingPackSchema = ReturnType<typeof startingPackSchema> & BaseItemSchema

export class StartingPackDataModel extends ItemDataModel<StartingPackSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...startingPackSchema()
        }
    }

    override async _preCreate(data: any, options: any, user: any) {
        await super._preCreate(data, options, user)
        this.parent.updateSource({ 'img': '/icons/containers/bags/pouch-leather-silver-white.webp' })
    }

    get cost(): Coins {
        return subtractCoins({ g: 3, s: 0, c: 0 }, this.value)
    }

    get consolidatedItems(): { name: string, qty: number, id: string }[] {
        const items: { id: string, name: string, qty: number }[] = []
        this.items.forEach(item => {
            const match = items.find(it => it.id === item.id)
            if (match) { match.qty += item.qty }
            else {
                items.push(foundry.utils.deepClone(item))
            }
        })
        return items
    }

    /**
     * This is called from [Hooks.on("createItem"...] and adds its items
     * to the target Hero, then deletes itself.
     * @param actor
     */
    async unpack(actor: Actor & { system: any }): Promise<void> {
        if (!actor || !actor.isOwner) return

        const equipment = ItemsCache.equipment()
        const groupedItems = groupBy('name', this.items)
        const itemsToCreate: any[] = []

        for (const key of Object.keys(groupedItems)) {
            const group = groupedItems[key]
            const sourceItem = equipment.find(eq => eq.id === group[0].id || (eq as any)._id === group[0].id || eq.uuid === group[0].uuid)
            if (!sourceItem) continue

            const fullDoc = await getFullItem(sourceItem)
            if (!fullDoc) continue

            const itemData = fullDoc.toObject()
            if (itemData.system?.bulk) {
                if (itemData.system.bulk.isStackable) {
                    itemData.system.bulk.quantity = group.length
                }
                else {
                    Array.from({ length: group.length }).forEach(_ => {
                        itemsToCreate.push(itemData)
                    })
                    continue
                }
            }

            itemsToCreate.push(itemData)
        }

        if (itemsToCreate.length > 0) {
            await actor.createEmbeddedDocuments("Item", itemsToCreate)
            await stackStackables(actor.system)
        }

        // Remove the starting pack itself
        await this.parent.delete()
    }

}