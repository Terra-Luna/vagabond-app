import { fields } from "../common/sharedSchemas"
import { ActorDataModel, BaseActorSchema } from "./ActorDataModel"
import { inventorySchema, isInventoryItem } from "./type/Inventory"

const npcSchema = () => {
    return {
        inventory: new fields.SchemaField({ ...inventorySchema() })
    }
}

export type NpcSchema = ReturnType<typeof npcSchema> & BaseActorSchema
export type Npc = NpcDataModel & NpcSchema

export class NpcDataModel extends ActorDataModel<NpcSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...npcSchema()
        }
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({ 'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL })
        this.parent.update({ 'prototypeToken.actorLink': true })
        this.parent.update({ 'system.health.current': 1 })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.inventory.items = this.parent.items.filter((i: any) => isInventoryItem(i))
    }
}