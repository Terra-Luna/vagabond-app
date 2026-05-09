import { AdversaryDataModel } from "../AdversaryDataModel.mjs"

test('threat-level caluclation', () => {
    const f = foundry.data.fields
    var adv = new AdversaryDataModel()
    adv.health.max = 11
    adv.armor.total = 3
    adv.actions = [
        {
            name: undefined,
            type: undefined,
            description: undefined,
            damage: "",
            avgDamage: 3
        },
        {
            name: undefined,
            type: undefined,
            description: undefined,
            damage: "",
            avgDamage: 4
        }
    ]
    expect(adv._calculateThreatLevel()).toBe(5.28)
})