import { damageTypeOptions, fields, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const spellSchema = () => {
    return {
        // What flavor of damage does this spell do?
        damageType: new fields.StringField({ ...damageTypeOptions() }),
        // Does this spell apply a burn effect?
        appliesBurn: new fields.BooleanField({ initial: false }),
        // What this spell does if cast for effect
        effect: new fields.StringField({ ...requiredString }),
        // How long this spell's effect lasts
        duration: new fields.StringField({ ...requiredString }),
        // What special effects does this spell have on crit?
        onCrit: new fields.StringField({ ...requiredString }),
        // Does this spell require a cast check?
        requiresSkillCheck: new fields.BooleanField({ initial: true }),
        // Does this spell require a damage/healing roll?
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