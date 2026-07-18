import { describe, expect, test } from "@jest/globals"
import { setSaves, HeroDataModel } from "../../../../src/model/actor/HeroDataModel"

describe('hero derived data tests', () => {
    test('test save calculations', () => {
        // Setup
        const hero = {
            stats: { might: 5, dexterity: 3, awareness: 6, reason: 7, presence: 2 },
            saves: { reflex: 20, endure: 20, will: 20 },
            modifiers: { saves: { reflex: 0, endure: 0, will: 0 } }
        } 
        // Execute
        setSaves(hero as unknown as HeroDataModel)
        // Verify
        expect(hero.saves.endure).toEqual(10)
        expect(hero.saves.reflex).toEqual(11)
        expect(hero.saves.will).toEqual(11)
    })

    test('test save calculations', () => {
        // Setup
        const hero = {
            stats: { might: 5, dexterity: 3, awareness: 6, reason: 7, presence: 2 },
            saves: { reflex: 20, endure: 20, will: 20 },
            modifiers: { saves: { reflex: 2, endure: 2, will: 2 } }
        }
        // Execute
        setSaves(hero as unknown as HeroDataModel)
        // Verify
        expect(hero.saves.endure).toEqual(8)
        expect(hero.saves.reflex).toEqual(9)
        expect(hero.saves.will).toEqual(9)
    })
    
})