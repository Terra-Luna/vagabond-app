import { damageTypeOptions, fields, optionalString, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const spellSchema = () => {
    return {
        damageType: new fields.StringField({ ...damageTypeOptions() }),
        appliesBurn: new fields.BooleanField({ initial: false }),
        burnCountdown: new fields.StringField({ ...optionalString, initial: 'Cd4' }),
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