import { fields } from "../common/sharedSchemas"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { inventorySchema, isInventoryItem } from "./type/Inventory"

const npcSchema = () => {
    return {
        inventory: new fields.SchemaField({ ...inventorySchema() })
    }
}

export type NpcSchema = ReturnType<typeof npcSchema> & BaseActorSchema
export type Npc = NpcDataModel & NpcSchema

export default class NpcDataModel extends ActorDataModel<NpcSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...npcSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        this.inventory.items = this.parent.items.filter(i => isInventoryItem(i))
    }
}