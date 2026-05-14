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
        // Spells this class is compelled to have.
        requiredSpells: new fields.ArrayField(
            new fields.SchemaField({ ...SpellDataModel.defineSchema() })
        )
    }
}

export type SpellCastingSchema = ReturnType<typeof spellcastingSchema>
export type SpellCasting = foundry.abstract.TypeDataModel<SpellCastingSchema, any>

export function setSpellcastingData(hero: HeroDataModel) {
    if (hero.class.spellcastingData.castSkill !== null) {
        setMaxMana(hero)
        setMaxManaPerCast(hero)
        setSpellSlots(hero)
    }
}

function setMaxMana(hero: HeroDataModel) {
    const spellcasting = hero.class.spellcastingData
    hero.mana.max = spellcasting.manaMultiplier! * hero.level.current!
}

function setMaxManaPerCast(hero: HeroDataModel) {
    const spellcasting = hero.class.spellcastingData
    const stat = hero.stats[spellcasting.maxPerCastStat] as number
    hero.mana.maxCast = stat + Math.ceil(hero.level.current! / 2)
}

function setSpellSlots(hero: HeroDataModel) {
    hero.class.spellcastingData.spellSlots =
        hero.class.spellcastingData.baseSpellSlots! +
        Math.floor((hero.level.current! - 1) / hero.class.spellcastingData.newSpellEvery!) +
        getBonusSpellSlots(hero)
}

/**
 * Loop thru the Hero's ancestry info and perks to check for any bonus spell slots.
 */
function getBonusSpellSlots(hero: HeroDataModel): number {
    return 0
}