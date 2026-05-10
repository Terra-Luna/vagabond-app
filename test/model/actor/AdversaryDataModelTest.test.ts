import { describe, expect, test } from "@jest/globals"
import AdversaryDataModel, { calculateThreatLevel } from "../../../src/model/actor/AdversaryDataModel"

describe("calculate threat-level", () => {
    test('calculate tl to two deci-places', () => {
        //Setup
        const adv = {
            health: { max: 31 }, armor: { total: 3 }, actions: [{ avgDamage: 3 }, { avgDamage: 4 }]
        } as AdversaryDataModel
        //Execute
        var tl = calculateThreatLevel(adv)
        //Verify
        expect(tl).toBe("1.22")
    })
})