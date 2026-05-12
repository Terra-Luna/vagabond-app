import { beingSizeOptions, beingTypeOptions, fields } from "../../common/sharedSchemas"
import ArmorDataModel from "./attribute/ArmorDataModel"
import HealthDataModel from "./attribute/HealthDataModel"
import SensesDataModel from "./attribute/SensesDataModel"

export const baseActorSchema = () => {
    return {
        health: new fields.SchemaField({ ...HealthDataModel.defineSchema() }),
        armor: new fields.SchemaField({ ...ArmorDataModel.defineSchema() }),
        senses: new fields.SchemaField({ ...SensesDataModel.defineSchema() }),
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