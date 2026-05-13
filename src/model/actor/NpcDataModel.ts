import { fields } from "../common/sharedSchemas"
import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"
import { inventorySchema } from "./type/Inventory"

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
        this.inventory.maxSlots = 99
    }
}