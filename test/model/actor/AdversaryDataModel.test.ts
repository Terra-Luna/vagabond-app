import { describe, expect, test } from "@jest/globals"
import AdversaryDataModel, { setThreatLevel } from "../../../src/model/actor/AdversaryDataModel"

describe('set threat level', () => {
    test('set tl with combo', () => {
        //Setup
        const actions = [
            { damage: { roll: '1d6', avg: 3 }, comboCount: 1 },
            { damage: { roll: '1d8', avg: 4 }, comboCount: 1 }
        ]
        const adv = {
            health: { max: 31 },
            armor: { rating: 3 },
            combo: { actions: actions }
        } 
        //Execute
        var tl = setThreatLevel(adv as unknown as AdversaryDataModel)
        //Verify
        expect(tl).toBe(3.44)
    })

    test('set tl avg of all actions', () => {
        //Setup
        const actions = [
            { damage: { roll: '1d12', avg: 6 } },
            { damage: { roll: '1d8', avg: 4 } }
        ]
        const adv = {
            health: { max: 31 },
            armor: { rating: 3 },
            actions: actions
        } 
        //Execute
        var tl = setThreatLevel(adv as unknown as AdversaryDataModel)
        //Verify
        expect(tl).toBe(3.11)
    })

    test('set when no actions', () => {
        //Setup
        const adv = {
            health: { max: 31 },
            armor: { rating: 3 }
        }
        //Execute
        var tl = setThreatLevel(adv as unknown as AdversaryDataModel)
        //Verify
        expect(tl).toBe(2.27)
    })
})