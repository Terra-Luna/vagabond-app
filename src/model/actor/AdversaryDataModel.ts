import { ActorDataModel } from "./ActorDataModel"
import { NpcSchema, npcSchema } from "./type/NpcSchema"
import { onNpcPreCreate, onUpdateNpc, prepareNpcBaseData, setThreatLevel } from "./util/NpcDataModelUtil"

export { setThreatLevel }

export class AdversaryDataModel extends ActorDataModel<NpcSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...npcSchema()
        }
    }

    override async _preCreate(data: any, options: any, user: any) {
        const allowed = await super._preCreate(data, options, user)
        onNpcPreCreate(this, options, data, allowed, false, CONST.TOKEN_DISPOSITIONS.HOSTILE)
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