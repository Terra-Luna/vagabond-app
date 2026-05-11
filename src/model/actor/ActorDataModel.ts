import ArmorDataModel from "./attribute/ArmorDataModel"
import HealthDataModel from "./attribute/HealthDataModel"
import SensesDataModel from "./attribute/SensesDataModel"

export const baseActorSchema = () => {
    const f = foundry.data.fields
    return {
        health: new f.SchemaField({ ...HealthDataModel.defineSchema() }),
        armor: new f.SchemaField({ ...ArmorDataModel.defineSchema() }),
        senses: new f.SchemaField({ ...SensesDataModel.defineSchema() }),
        size: new f.StringField({
            choices: ['small', 'medium', 'large', 'huge', 'giant', 'colossal'],
            initital: 'medium'
        }),
        beingType: new f.StringField({
            choices: ['artificial', 'beast', 'cryptid', 'fae', 'humanlike', 'outer', 'primordial', 'undead'],
            initial: 'humanlike'
        })
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