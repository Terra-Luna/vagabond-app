import { describe, expect, test } from "@jest/globals";
import HeroDataModel, { Hero } from "../../../../src/model/actor/HeroDataModel";
import { calculateSaves } from "../../../../src/model/actor/type/Saves";

describe('hero derived data tests', () => {
    test('test save calculations', () => {
        // Setup
        const hero = {
            stats: { might: 5, dexterity: 3, awareness: 6, reason: 7, presence: 2 },
            saves: { endure: 20, reflex: 20, will: 20 }
        } as unknown as Hero
        // Execute
        calculateSaves(hero)
        // Verify
        expect(hero.saves.endure).toEqual(10)
        expect(hero.saves.reflex).toEqual(11)
        expect(hero.saves.will).toEqual(11)
    })
})