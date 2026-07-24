import { ItemsCache } from "../../../rules/util/ItemsCache"
import { HeroDataModel } from "../../actor/HeroDataModel"
import { addCoins, Coins, coinSchema, subtractCoins } from "../../common/CoinValue"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { ItemDataModel, BaseItemSchema } from "../ItemDataModel"

export const starterPackSchema = () => {
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

export type StarterPackSchema = ReturnType<typeof starterPackSchema> & BaseItemSchema

export class StarterPackDataModel extends ItemDataModel<StarterPackSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...starterPackSchema()
        }
    }

    get cost(): Coins {
        return subtractCoins({ g: 3, s: 0, c: 0 }, this.value)
    }

    get consolidatedItems(): { name: string, qty: number }[] {
        const items: { id: string, name: string, qty: number }[] = []
        this.items.forEach(item => {
            const match = items.find(it => it.id === item.id)
            if (match) { match.qty += item.qty }
            else { items.push(item) }
        })
        return items
    }

    /**
     * This is called from [Hooks.on("createItem"...] and adds its items
     * to the target Hero, then deletes itself.
     * @param hero
     */
    async unpack(hero: Actor & { system: HeroDataModel }): Promise<void> {
        const itemsToCreate: any[] = []
        const eqipment = ItemsCache.equipment()

        for (const entry of this.items) {
            const sourceItem = eqipment.find(eq => eq.id === entry.id)
            if (!sourceItem) continue

            const itemData = sourceItem.toObject()
            if (itemData.system?.bulk) {
                itemData.system.bulk.quantity = entry.qty
            }
            itemsToCreate.push(itemData)
        }
        
        if (itemsToCreate.length > 0) {
            await hero.createEmbeddedDocuments("Item", itemsToCreate)
        }

        // Remove the starter pack itself
        await this.parent.delete()
    }

}