import { fields } from "../../../../common/sharedSchemas"
import SpellDataModel from "../SpellDataModel"

export const spellcastingSchema = () => {
    return {
        // Skill used to make Cast Checks
        castSkill: new fields.StringField({ initial: null, nullable: true, required: false }),
        // Max mana = [this] * level
        manaMultiplier: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        // Max mana per cast = [this] + (level / 2), rounded up
        maxPerCastStat: new fields.StringField({ initial: '' }),
        // Spells this class is compelled to have
        requiredSpells: new fields.ArrayField(
            new fields.SchemaField({ ...SpellDataModel.defineSchema() })
        ),
        // Class learns a new spell every [this] levels after the first
        newSpellEvery: new fields.NumberField({ integer: true })
    }
}