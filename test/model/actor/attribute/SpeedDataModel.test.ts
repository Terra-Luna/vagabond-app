import { describe, expect, test } from "@jest/globals"
import { Speed, calculateSpeeds } from "../../../../src/model/actor/attribute/Speed"

describe('test hero speed data', () => {
    test('slow hero', () => {
        // Setup
        const speed = { turn: 0, crawl: 0, travel: 0 }
        // Execute
        calculateSpeeds(3, (speed as unknown as Speed))
        //Verify
        expect(speed.turn).toEqual(25)
        expect(speed.crawl).toEqual(75)
        expect(speed.travel).toEqual(5)
    })
    test('mid hero', () => {
        // Setup
        const speed = { turn: 0, crawl: 0, travel: 0 }
        // Execute
        calculateSpeeds(5, (speed as unknown as Speed))
        //Verify
        expect(speed.turn).toEqual(30)
        expect(speed.crawl).toEqual(90)
        expect(speed.travel).toEqual(6)
    })
    test('fast hero', () => {
        // Setup
        const speed = { turn: 0, crawl: 0, travel: 0 }
        // Execute
        calculateSpeeds(6, (speed as unknown as Speed))
        //Verify
        expect(speed.turn).toEqual(35)
        expect(speed.crawl).toEqual(105)
        expect(speed.travel).toEqual(7)
    })
    test('fast hero with bonus', () => {
        // Setup
        const speed = { turn: 0, crawl: 0, travel: 0, bonus: 5 }
        // Execute
        calculateSpeeds(6, (speed as unknown as Speed))
        //Verify
        expect(speed.turn).toEqual(40)
        expect(speed.crawl).toEqual(120)
        expect(speed.travel).toEqual(7)
    })
})