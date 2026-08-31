import { coinSchema } from "../common/CoinValue"
import { fields } from "../common/sharedSchemas"
import { ActorDataModel } from "./ActorDataModel"
import { onNpcPreCreate } from "./util/NpcDataModelUtil"

export class ItemActorDataModel extends ActorDataModel<any> {
    /**
     * Blank Actor data model for support with plugins such as Item Piles.
     */
    static defineSchema() {
        return {
            ...super.defineSchema(),
            inventory: new fields.SchemaField({
                coins: new fields.SchemaField({ ...coinSchema() })
            })
        }
    }

    override async _preCreate(data: any, options: any, user: any) {
        const allowed = await super._preCreate(data, options, user)
        onNpcPreCreate(this, options, data, allowed, false, CONST.TOKEN_DISPOSITIONS.NEUTRAL)
    }

}