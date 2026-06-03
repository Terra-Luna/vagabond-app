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
        senses: new fields.ArrayField(new fields.SchemaField({ ...sensesSchema() }), { initial: [] })
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
        super.prepareBaseData()
        this.ancestry = this.parent.items.find(i => i.type === 'ancestry')
    }
}

/**
 * Helper function to check Actor types against system models.
 * E.g.: if (is<HeroDataModel>(actor)) { ... }
 * @param actor 
 * @returns 
 */
export const is = <T>(actor: Actor): boolean => {
    return <T><unknown>actor !== undefined
}