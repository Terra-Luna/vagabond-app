import { lang } from "../../utils/lang"
import { fields, requiredString } from "../common/sharedSchemas"
import { armorSchema } from "./type/Armor"
import { healthSchema } from "./type/Health"

export const baseActorSchema = () => {
    return {
        health: new fields.SchemaField({ ...healthSchema() }),
        armor: new fields.SchemaField({ ...armorSchema() }),
        senses: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Senses) }))
    }
}

export type BaseActorSchema = ReturnType<typeof baseActorSchema>

export abstract class ActorDataModel<T extends BaseActorSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return {
            ...baseActorSchema()
        }
    }
}