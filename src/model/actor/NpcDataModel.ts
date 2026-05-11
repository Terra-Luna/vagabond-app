import ActorDataModel, { BaseActorSchema } from "./ActorDataModel"

const npcSchema = () => {
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