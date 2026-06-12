export default async function createEquipment() {
    const folder = "Equipment"
    if (!game.folders?.getName(folder)) {
        await Folder.create({ name: folder, type: "Item" })
    }

    const longsword = {
        name: 'Longsword',
        type: 'weapon',
        img: 'icons/weapons/swords/sword-guard.webp',
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
            category: 'Weapons',
            value: { g: 0, s: 40, c: 0 },
            relicEffects: [] // { type: string, power: schema, addedCoinValue: { ...coinSchema() }}
        }
    }
    await Item.create(longsword)

    const shotgun = {
        name: 'Shotgun',
        type: 'weapon',
        img: 'icons/weapons/guns/gun-double-barrel.webp',
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
            category: 'Weapons',
            value: { g: 1, s: 60, c: 0 },
            relicEffects: [] // { type: string, power: schema, addedCoinValue: { ...coinSchema() }}
        }
    }
    await Item.create(shotgun)

    const caestus = {
        name: 'Caestus',
        type: 'weapon',
        img: 'icons/weapons/fist/fist-knuckles-spiked-brown.webp',
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
        img: 'icons/equipment/shield/heater-steel-grey.webp',
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
            category: 'Weapons',
            value: { g: 0, s: 75, c: 0 },
            relicEffects: []
        }
    }
    await Item.create(shield)

    const heavy_armor = {
        name: 'Heavy Armor',
        type: 'armor',
        img: 'icons/equipment/chest/breastplate-banded-blue.webp',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: '',
            armorType: 'heavy',
            rating: 3,
            mightReq: 5,
            material: 'Orichalcum',
            slots: 3,
            quantity: 1,
            isEquipped: false,
            category: 'Armor',
            value: { g: 1, s: 0, c: 0 },
            relicEffects: []
        }
    }
    await Item.create(heavy_armor)

    const alchemistfire = {
        name: "Alchemists Fire",
        type: 'alchemical',
        system: {
            description: 'A flammable, tar-like fluid that ignites when exposed to oxygen, dealing 2d6 damage and Burning (Cd6) a hit Target.',
            category: 'Alchemy',
            damage: '',
            damageType: '',
            slots: 1,
            quantity: 1,
            value: { g: 2, s: 50 }
        }
    }
    await Item.create(alchemistfire)
}