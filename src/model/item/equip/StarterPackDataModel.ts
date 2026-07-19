import { HeroDataModel } from "../../actor/HeroDataModel"
import { addCoins, coinSchema } from "../../common/CoinValue"
import { fields, requiredInteger, requiredString } from "../../common/sharedSchemas"
import { ItemDataModel, BaseItemSchema } from "../ItemDataModel"

export const starterPackSchema = () => {
    return {
        items: new fields.ArrayField(new fields.SchemaField({
            id: new fields.StringField({ ...requiredString }),
            name: new fields.StringField({ ...requiredString }),
            qty: new fields.NumberField({ ...requiredInteger, initial: 1 })
        }), { initial: [] }),
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

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'system.category': 'containers'
        })
    }

    /**
     * This is called from [Hooks.on("createItem"...] and adds its items
     * to the target Hero, then deletes itself.
     * @param hero
     */
    async unpack(hero: Actor & { system: HeroDataModel }): Promise<void> {
        const itemsToCreate: any[] = []

        for (const entry of this.items) {
            const sourceItem = game.items?.get(entry.id)
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

        const combinedCoins = addCoins([hero.system.inventory.coins, this.value])

        await hero.update({ 'system.inventory.coins': combinedCoins } as Record<string, any>)

        // Remove the starter pack itseslf
        await this.parent.delete()
    }

}