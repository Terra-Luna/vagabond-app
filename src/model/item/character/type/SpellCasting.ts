import HeroDataModel from "../../../actor/HeroDataModel"
import { fields, requiredInteger } from "../../../common/sharedSchemas"
import SpellDataModel from "../SpellDataModel"

export const spellcastingSchema = () => {
    return {
        // Skill used to make Cast Checks.
        castSkill: new fields.StringField({ initial: null, nullable: true, required: false }),
        // Max mana = multiplier * level.
        manaMultiplier: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        // Max mana per cast = [this] + (level / 2), rounded up.
        maxPerCastStat: new fields.StringField({ initial: '' }),
        // How many spell slots this class starts with.
        baseSpellSlots: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        // Class learns a new spell every X levels after the first.
        newSpellEvery: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        // Total spell slots available (derived)
        spellSlots: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        // This hero's prepared spells
        spells: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() })),
        // Spells this class is compelled to have.
        requiredSpells: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() }))
    }
}

export function setSpellcasting(hero: HeroDataModel) {
    if (hero.class.spellcasting.castSkill !== null) {
        setMaxMana(hero)
        setMaxManaPerCast(hero)
        setSpellSlots(hero)
        mergeSpellsToClass(hero)
    }
}

function setMaxMana(hero: HeroDataModel) {
    const spellcasting = hero.class.spellcasting
    hero.mana.max = spellcasting.manaMultiplier! * hero.level.current!
}

function setMaxManaPerCast(hero: HeroDataModel) {
    const spellcasting = hero.class.spellcasting
    const stat = hero.stats[spellcasting.maxPerCastStat] as number
    hero.mana.maxCast = stat + Math.ceil(hero.level.current! / 2)
}

function setSpellSlots(hero: HeroDataModel) {
    hero.class.spellcasting.spellSlots =
        hero.class.spellcasting.baseSpellSlots! +
        Math.floor((hero.level.current! - 1) / hero.class.spellcasting.newSpellEvery!) +
        hero.bonus.spellSlots!
}

function mergeSpellsToClass(hero: HeroDataModel) {
    const classSpells = hero.class.spellcasting.spells
    const ancestralSpells = hero.ancestry.spellcasting.spells
    hero.class.spellcasting.spells = [...classSpells, ...ancestralSpells]
}