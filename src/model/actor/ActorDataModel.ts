import { beingSizeOptions, beingTypeOptions, fields } from "../common/sharedSchemas"
import { armorSchema } from "./attribute/Armor"
import { healthSchema } from "./attribute/Health"
import { sensesSchema } from "./attribute/Senses"

export const baseActorSchema = () => {
    return {
        health: new fields.SchemaField({ ...healthSchema() }),
        armor: new fields.SchemaField({ ...armorSchema() }),
        senses: new fields.SchemaField({ ...sensesSchema() }),
        size: new fields.StringField({ ...beingSizeOptions() }),
        beingType: new fields.StringField({ ...beingTypeOptions() })
    }
}

export type BaseActorSchema = ReturnType<typeof baseActorSchema>

export default abstract class ActorDataModel<T extends BaseActorSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return {
            ...baseActorSchema()
        }
    }

    override async prepareDerivedData() {

    }
}