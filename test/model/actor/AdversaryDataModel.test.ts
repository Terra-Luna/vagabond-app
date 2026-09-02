import { describe, expect, test } from "@jest/globals"

import { AdversaryDataModel, setThreatLevel } from "../../../src/model/actor/AdversaryDataModel"

describe('set threat level', () => {
    test('set tl with combo', () => {
        //Setup
        const actions = [
            { damage: { dice: { count: 1, faces: 6 } }, comboCount: 1 },
            { damage: { dice: { count: 1, faces: 8 } }, comboCount: 1 }
        ]
        const adv = {
            health: { max: 31 },
            armor: { rating: 3 },
            combo: { actions: actions }
        } 
        //Execute
        const tl = setThreatLevel(adv as unknown as AdversaryDataModel)
        //Verify
        expect(tl).toBe(3.77)
    })

    test('set tl avg of all actions', () => {
        //Setup
        const actions = [
            { damage: { dice: { count: 1, faces: 12 } } },
            { damage: { dice: { count: 1, faces: 8 } } }
        ]
        const adv = {
            health: { max: 31 },
            armor: { rating: 3 },
            actions: actions
        } 
        //Execute
        const tl = setThreatLevel(adv as unknown as AdversaryDataModel)
        //Verify
        expect(tl).toBe(3.27)
    })

    test('set when no actions', () => {
        //Setup
        const adv = {
            health: { max: 31 },
            armor: { rating: 3 }
        }
        //Execute
        const tl = setThreatLevel(adv as unknown as AdversaryDataModel)
        //Verify
        expect(tl).toBe(2.27)
    })
})