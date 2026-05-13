import { fields } from "../common/sharedSchemas"
import AncestryDataModel from "../item/character/AncestryDataModel"
import { armorSchema } from "./type/Armor"
import { healthSchema } from "./type/Health"
import { sensesSchema } from "./type/Senses"

export const baseActorSchema = () => {
    return {
        health: new fields.SchemaField({ ...healthSchema() }),
        armor: new fields.SchemaField({ ...armorSchema() }),
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        senses: new fields.SchemaField({ ...sensesSchema() })
    }
}

export type BaseActorSchema = ReturnType<typeof baseActorSchema>

export default abstract class ActorDataModel<T extends BaseActorSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return {
            ...baseActorSchema()
        }
    }
}