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
                state: 'H'
            },
            properties: ['keen'],
            explodeData: {
                canExplode: false,
                explodesOn: []
            },
            material: 'standard',
            isCrude: false,
            bulk: {
                slots: 2,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
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
                style: 'HH',
                state: 'HH'
            },
            properties: ['brutal', 'ranged'],
            explodeData: {
                canExplode: false,
                explodesOn: []
            },
            material: 'standard',
            isCrude: false,
            bulk: {
                slots: 2,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
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
            bulk: {
                slots: 1,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
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
                style: 'H',
                state: 'H'
            },
            properties: ['shield'],
            explodeData: {
                canExplode: false,
                explodesOn: []
            },
            material: 'standard',
            isCrude: false,
            bulk: {
                slots: 2,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
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
            bulk: {
                slots: 3,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
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
            bulk: {
                slots: 2,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
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
            bulk: {
                slots: 2,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
            isEquipped: false,
            category: 'armor',
            value: { g: 0, s: 50, c: 0 },
            relicEffects: []
        }
    }
    await Item.create(light_armor)

    const materials_20 = {
        name: "Materials",
        type: 'sundry',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: '',
            category: 'alchemy',
            damage: '',
            damageType: '',
            bulk: {
                slots: 0,
                quantity: 20,
                isStackable: true,
                stackSize: 20
            },
            value: { s: 5 }
        }
    }
    await Item.create(materials_20)

    const alchemistfire = {
        name: "Alchemist's Fire",
        type: 'alchemical',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: 'A flammable, tar-like fluid that ignites when exposed to oxygen, dealing 2d6 damage and Burning (Cd6) a hit Target.',
            category: 'alchemy',
            damage: '',
            damageType: '',
            bulk: {
                slots: 2,
                quantity: 1,
                isStackable: true,
                stackSize: 1
            },
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
            bulk: {
                slots: 0,
                quantity: 1,
                isStackable: false,
                stackSize: 1
            },
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