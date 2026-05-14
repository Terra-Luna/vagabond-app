import { describe, expect, test } from "@jest/globals";
import HeroDataModel from "../../../../src/model/actor/HeroDataModel";
import { setSenses } from "../../../../src/model/actor/type/Senses";

describe('testing senses', () => {
    test('merge actor senses from ancestry', () => {
        //Setup
        const hero = {
            ancestry: {
                senses: [
                    { name: "a", description: "b" },
                    { name: "x", description: "y" }
                ]
            },
            senses: [{ name: "a", description: "b" }]
        }
        
        //Execute
        setSenses(hero as unknown as HeroDataModel)
        //Verify
        expect(hero.senses.length).toEqual(2)
        /* expect(hero.senses).toContain([
            { name: "a", description: "b" },
            { name: "x", description: "y" }
        ]) */
    })
})