import test, { describe } from "node:test";
import { AdversaryDataModel } from "../Adversary.mjs";


describe('testing threat level calculation', () => {
    test('expected val: 1.23', () => {
        var adv = new AdversaryDataModel()
        adv.armor.total = 2
        adv.health.max = 11
        assert
    });
});