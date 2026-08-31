import { fields } from "../common/sharedSchemas"
import { ActorDataModel } from "./ActorDataModel"
import { inventorySchema } from "./type/Inventory"
import { NpcSchema, npcSchema } from "./type/NpcSchema"
import { onNpcPreCreate, onUpdateNpc, prepareNpcBaseData } from "./util/NpcDataModelUtil"

export class NpcDataModel extends ActorDataModel<NpcSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...npcSchema(),
            inventory: new fields.SchemaField({ ...inventorySchema() })
        }
    }

    override async _preCreate(data: any, options: any, user: any) {
        const allowed = await super._preCreate(data, options, user)
        onNpcPreCreate(this, options, data, allowed, true, CONST.TOKEN_DISPOSITIONS.NEUTRAL)
    }

    override async _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId)
        onUpdateNpc(this, changed)
    }

    override prepareBaseData() {
        super.prepareBaseData()
        prepareNpcBaseData(this)
    }

}