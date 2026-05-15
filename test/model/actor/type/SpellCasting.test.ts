import { describe, expect, test } from "@jest/globals";
import { setspellcasting } from "../../../../src/model/item/character/type/SpellCasting";
import HeroDataModel from "../../../../src/model/actor/HeroDataModel";

describe('spellcasting schema tests', () => {
    test('test spellcasting calculations', () => {
        //Setup
        const hero = {
            level: { current: 8 },
            stats: { awareness: 7 },
            mana: { max: 0, maxCast: 0 },
            class: {
                spellcasting: {
                    castSkill: 'mysticism',
                    manaMultiplier: 3,
                    maxPerCastStat: 'awareness',
                    baseSpellSlots: 4,
                    newSpellEvery: 2,
                    spellSlots: 0
                }
            }
        }
        //Execute
        setspellcasting(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.mana.max).toEqual(24)
        expect(hero.mana.maxCast).toEqual(11)
        expect(hero.class.spellcasting.spellSlots).toEqual(7)
    })

    test('test spellcasting calculations round up', () => {
        //Setup
        const hero = {
            level: { current: 7 },
            stats: { awareness: 7 },
            mana: { max: 0, maxCast: 0 },
            class: {
                spellcasting: {
                    castSkill: 'mysticism',
                    manaMultiplier: 3,
                    maxPerCastStat: 'awareness',
                    baseSpellSlots: 4,
                    newSpellEvery: 2,
                    spellSlots: 0
                }
            }
        }
        //Execute
        setspellcasting(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.mana.max).toEqual(21)
        expect(hero.mana.maxCast).toEqual(11)
        expect(hero.class.spellcasting.spellSlots).toEqual(7)
    })

    test('skip spellcasting setup if no casting stat', () => {
        const hero = {
            level: { current: 7 },
            mana: { max: 0, maxCast: 0 },
            stats: { awareness: 7 },
            class: { spellcasting: { castSkill: null } }
        }
        //Execute
        setspellcasting(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.mana.max).toEqual(0)
        expect(hero.mana.maxCast).toEqual(0)
    })
})