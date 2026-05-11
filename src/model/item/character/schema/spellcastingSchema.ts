import SpellDataModel from "../SpellDataModel";

export const spellcastingSchema = () => {
    const f = foundry.data.fields;
    return {
        // Skill used to make Cast Checks
        castSkill: new f.StringField({ initial: null, nullable: true, required: false }),
        // Max mana = [this] * level
        manaMultiplier: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        // Max mana per cast = [this] + (level / 2), rounded up
        maxPerCastStat: new f.StringField({ initial: '' }),
        // Spells this class is compelled to have
        requiredSpells: new f.ArrayField(
            new f.SchemaField({ ...SpellDataModel.defineSchema() })
        ),
        // Class learns a new spell every [this] levels after the first
        newSpellEvery: new f.NumberField({ integer: true })
    };
};