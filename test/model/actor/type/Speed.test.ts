import { describe, expect, test } from "@jest/globals"
import { setSpeeds } from "../../../../src/model/actor/type/Speed"
import HeroDataModel from "../../../../src/model/actor/HeroDataModel"

describe('test hero speed data', () => {
    test('slow hero', () => {
        // Setup
        const hero = {
            stats: { dexterity: 3 },
            speed: { turn: 0, crawl: 0, travel: 0 },
            bonus: { speed: 0 }
        }
        // Execute
        setSpeeds(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.speed.turn).toEqual(25)
        expect(hero.speed.crawl).toEqual(75)
        expect(hero.speed.travel).toEqual(5)
    })
    
    test('mid hero', () => {
        // Setup
        const hero = {
            stats: { dexterity: 5 },
            speed: { turn: 0, crawl: 0, travel: 0 },
            bonus: { speed: 0 }
        }
        // Execute
        setSpeeds(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.speed.turn).toEqual(30)
        expect(hero.speed.crawl).toEqual(90)
        expect(hero.speed.travel).toEqual(6)
    })

    test('fast hero', () => {
        // Setup
        const hero = {
            stats: { dexterity: 6 },
            speed: { turn: 0, crawl: 0, travel: 0 },
            bonus: { speed: 0 }
        }
        // Execute
        setSpeeds(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.speed.turn).toEqual(35)
        expect(hero.speed.crawl).toEqual(105)
        expect(hero.speed.travel).toEqual(7)
    })

})