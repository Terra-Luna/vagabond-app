import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"

const npcSchema = () => {
    const f = foundry.data.fields
    return {

    }
}

export type NpcSchema = ReturnType<typeof npcSchema> & BaseActorSchema

export default class NpcDataModel extends ActorDataModel<NpcSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...npcSchema()
        }
    }
}