const folder = "Equipment"
if (!game.folders?.getName(folder)) {
    await Folder.create({ name: folder, type: "Item" })
}

const longsword = {
    name: 'Longsword',
    type: 'weapon',
    folder: game.folders?.getName(folder)?.id,
    system: {
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
        category: 'Weapons',
        value: { g: 0, s: 40, c: 0 },
        relicEffects: [] // { type: string, power: schema, addedCoinValue: { ...coinSchema() }}
    }
}
await Item.create(longsword)

const shotgun = {
    name: 'Shotgun',
    type: 'weapon',
    folder: game.folders?.getName(folder)?.id,
    system: {
        description: '',
        range: 'Near',
        damage: {
            oneHand: '1d10',
            twoHand: '1d10'
        },
        grip: {
            style: '2H',
            state: '2H'
        },
        properties: ['Brutal, Ranged'],
        explodeData: {
            canExplode: false,
            explodesOn: []
        },
        material: 'Standard',
        isCrude: false,
        slots: 2,
        isStackable: false,
        isEquippable: true,
        category: 'Weapons',
        value: { g: 1, s: 60, c: 0 },
        relicEffects: [] // { type: string, power: schema, addedCoinValue: { ...coinSchema() }}
    }
}
await Item.create(shotgun)

const caestus = {
    name: 'Caestus',
    type: 'weapon',
    folder: game.folders?.getName(folder)?.id,
    system: {
        description: '',
        range: 'Close',
        damage: {
            oneHand: '1d4',
            twoHand: '1d4'
        },
        grip: {
            style: 'F',
            state: 'F'
        },
        properties: ['Brawl'],
        explodeData: {
            canExplode: false,
            explodesOn: []
        },
        material: 'Standard',
        isCrude: false,
        slots: 1,
        isStackable: false,
        isEquippable: true,
        isEquipped: false,
        category: 'Weapons',
        value: { g: 0, s: 40, c: 0 },
        relicEffects: []
    }
}
await Item.create(caestus)

const shield = {
    name: 'Standard Shield',
    type: 'weapon',
    folder: game.folders?.getName(folder)?.id,
    system: {
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
        isStackable: false,
        isEquippable: true,
        category: 'Weapons',
        value: { g: 0, s: 75, c: 0 },
        relicEffects: []
    }
}
await Item.create(shield)

const heavy_armor = {
    name: 'Heavy Armor',
    type: 'armor',
    folder: game.folders?.getName(folder)?.id,
    system: {
        description: '',
        armorType: 'heavy',
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
        relicEffects: []
    }
}
await Item.create(heavy_armor)