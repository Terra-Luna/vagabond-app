const longsword = {
    name: 'Longsword',
    type: 'weapon',
    system: {
        name: 'Longsword',
        description: '',
        range: 'Close',
        damage: {
            oneHand: '1d8',
            twoHand: '1d10'
        },
        grip: {
            style: 'V',
            state: '1H'
        },
        properties: ['Keen'],
        explodeData: {
            canExplode: false,
            explodesOn: []
        },
        material: 'Standard',
        isCrude: false,
        slots: 2,
        quantity: 1,
        isStackable: false,
        isEquippable: true,
        isEquipped: false,
        category: 'Weapons',
        value: { g: 0, s: 40, c: 0 },
        relicEffects: [] // { type: string, power: schema, addedCoinValue: { ...coinSchema() }}
    }
}
await Item.create(longsword)

const shield = {
    name: 'Standard Shield',
    type: 'weapon',
    system: {
        name: 'Standard Shield',
        description: '',
        range: 'Close',
        damage: {
            oneHand: '1d4',
            twoHand: '1d4'
        },
        grip: {
            style: '1H',
            state: '1H'
        },
        properties: ['Shield'],
        explodeData: {
            canExplode: false,
            explodesOn: []
        },
        material: 'Standard',
        isCrude: false,
        slots: 2,
        quantity: 1,
        isStackable: false,
        isEquippable: true,
        isEquipped: false,
        category: 'Weapons',
        value: { g: 0, s: 75, c: 0 },
        relicEffects: [] // { type: string, power: schema, addedCoinValue: { ...coinSchema() }}
    }
}
await Item.create(shield)

const heavy_armor = {
    name: 'Heavy Armor',
    type: 'armor',
    system: {
        name: 'Heavy Armor',
        description: '',
        type: 'heavy',
        rating: 3,
        mightReq: 5,
        material: 'Orichalcum',
        slots: 3,
        quantity: 1,
        isStackable: false,
        isEquippable: true,
        isEquipped: false,
        category: 'Armor',
        value: { g: 1, s: 0, c: 0 },
        relicEffects: [] // { type: string, power: schema, addedCoinValue: { ...coinSchema() }}
    }
}
await Item.create(heavy_armor)