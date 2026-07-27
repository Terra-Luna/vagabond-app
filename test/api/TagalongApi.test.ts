import { test, describe, expect } from "@jest/globals";
import { parseHeroId, fetchHero } from "../../src/apps/importer/TagalongApi"

const tagalong = 'https://www.vgbnd.app/character/'
const testId = 'e38db88c-ec28-4b67-a44c-09f0fe199d01'
const testUrl = new URL(`${tagalong}${testId}`)

describe('tagalong api tests', () => {
    test('test parse hero id from url', () => {
        //Setup & Execute
        const heroId = parseHeroId(testUrl)
        //Verify
        expect(heroId).toBe(testId)
    })

    /* test('call the api', async () => {
        //Setup & Execute
        const hero = await fetchHero(testUrl)
        //Verify
        expect(hero.character.name).toBe("Orphenia")
    }) */
})