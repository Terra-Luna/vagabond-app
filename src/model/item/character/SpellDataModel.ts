import { damageTypeOptions, fields, optionalString, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const spellSchema = () => {
    return {
        // What flavor of damage does this spell do?
        damageType: new fields.StringField({ ...damageTypeOptions() }),
        // Does this spell apply a burn effect?
        effectAppliesBurn: new fields.BooleanField({ initial: false }),
        effectBurnCountdown: new fields.StringField({ ...requiredString, initial: '-' }),
    }
}

export type SpellSchema = ReturnType<typeof spellSchema> & BaseItemSchema

export default class SpellDataModel extends ItemDataModel<SpellSchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...spellSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
        
    }
}