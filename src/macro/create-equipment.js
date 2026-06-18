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
            range: 'close',
            damage: {
                oneHand: '1d8',
                twoHand: '1d10'
            },
            grip: {
                style: 'V',
                state: '1H'
            },
            properties: ['keen'],
            explodeData: {
                canExplode: false,
                explodesOn: []
            },
            material: 'standard',
            isCrude: false,
            slots: 2,
            quantity: 1,
            category: 'weapons',
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
            range: 'near',
            damage: {
                oneHand: '1d10',
                twoHand: '1d10'
            },
            grip: {
                style: '2H',
                state: '2H'
            },
            properties: ['brutal', 'ranged'],
            explodeData: {
                canExplode: false,
                explodesOn: []
            },
            material: 'standard',
            isCrude: false,
            slots: 2,
            category: 'weapons',
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
            range: 'close',
            damage: {
                oneHand: '1d4',
                twoHand: '1d4'
            },
            grip: {
                style: 'F',
                state: 'F'
            },
            properties: ['brawl'],
            explodeData: {
                canExplode: false,
                explodesOn: []
            },
            material: 'standard',
            isCrude: false,
            slots: 1,
            isEquipped: false,
            category: 'weapons',
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
            range: 'close',
            damage: {
                oneHand: '1d4',
                twoHand: '1d4'
            },
            grip: {
                style: '1H',
                state: '1H'
            },
            properties: ['shield'],
            explodeData: {
                canExplode: false,
                explodesOn: []
            },
            material: 'standard',
            isCrude: false,
            slots: 2,
            category: 'weapons',
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
            material: 'standard',
            slots: 3,
            quantity: 1,
            isEquipped: false,
            category: 'armor',
            value: { g: 2, s: 0, c: 0 },
            relicEffects: []
        }
    }
    await Item.create(heavy_armor)

    const med_armor = {
        name: 'Medium Armor',
        type: 'armor',
        img: 'icons/equipment/chest/breastplate-quilted-brown.webp',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: '',
            armorType: 'medium',
            rating: 2,
            mightReq: 4,
            material: 'standard',
            slots: 2,
            quantity: 1,
            isEquipped: false,
            category: 'armor',
            value: { g: 1, s: 0, c: 0 },
            relicEffects: []
        }
    }
    await Item.create(med_armor)

    const light_armor = {
        name: 'Light Armor',
        type: 'armor',
        img: 'icons/equipment/chest/shirt-collared-green.webp',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: '',
            armorType: 'light',
            rating: 1,
            mightReq: 3,
            material: 'standard',
            slots: 2,
            quantity: 1,
            isEquipped: false,
            category: 'armor',
            value: { g: 0, s: 50, c: 0 },
            relicEffects: []
        }
    }
    await Item.create(light_armor)

    const alchemistfire = {
        name: "Alchemist's Fire",
        type: 'alchemical',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: 'A flammable, tar-like fluid that ignites when exposed to oxygen, dealing 2d6 damage and Burning (Cd6) a hit Target.',
            category: 'alchemy',
            damage: '',
            damageType: '',
            slots: 1,
            quantity: 1,
            value: { g: 2, s: 50 }
        }
    }
    await Item.create(alchemistfire)

    const backpack = {
        name: "Backpack",
        type: 'container',
        img: 'icons/containers/bags/pack-engraved-leather-leaf-tan.webp',
        folder: game.folders?.getName(folder)?.id,
        system: {
            slots: 0,
            capacity: 2,
            category: 'containers'
        }
    }
    await Item.create(backpack)
    const bp = game.items.getName("Backpack")
    const backpackEffect = {
        name: 'Backpack',
        origin: bp.uuid,
        changes: [
            { key: 'system.inventory.capacity', mode: '2', value: 2, priority: 20 }
        ],
        disabled: false,
        transfer: true
    }
    await bp.createEmbeddedDocuments('ActiveEffect', [backpackEffect])

}