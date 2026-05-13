import { damageTypeOptions, fields, requiredString } from "../../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../../ItemDataModel"

const spellSchema = () => {
    return {
        damageType: new fields.StringField({ ...damageTypeOptions() }),
        appliesBurn: new fields.BooleanField({ initial: false }),
        duration: new fields.StringField({ ...requiredString }),
        effect: new fields.StringField({ ...requiredString }),
        onCrit: new fields.StringField({ ...requiredString }),
        requiresSkillCheck: new fields.BooleanField({ initial: true }),
        isDamageOrHealing: new fields.BooleanField({ initial: true })
    }
}

export type SpellSchema = ReturnType<typeof spellSchema> & BaseItemSchema
export type Spell = SpellDataModel<SpellSchema> & SpellSchema

export default class SpellDataModel<T extends SpellSchema> extends ItemDataModel<T> {
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