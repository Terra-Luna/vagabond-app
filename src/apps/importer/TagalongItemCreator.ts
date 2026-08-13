import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { lang } from "../../utils/lang"
import { TagalongItem } from "./TagalongApi"

export class TagalongItemCreator {

    hero: HeroDataModel
    items: TagalongItem[]
    errors: string[]

    importsFolder: string = "Tagalong Imports"

    constructor(hero: HeroDataModel, items: TagalongItem[]) {
        this.hero = hero
        this.items = items
        this.errors = []
    }

    async convert() {
        if (this.items.length > 0) {
            if (!game.folders?.getName(this.importsFolder)) {
                console.info("Tagalong Item Creator: Creating folder:", this.importsFolder)
                await Folder.create({ name: this.importsFolder, type: "Item" })
            }
            for (const i of this.items) {
                console.info("Tagalong Item Creator: Creating item", i)
                switch (i.type) {
                    case ItemType.ALCHEMY:
                    case ItemType.MEDICINE: {
                        await this.handleAlchemyItem(i)
                        break
                    }
                    case ItemType.ARMOR: {
                        await this.handleArmorItem(i)
                        break
                    }
                    case ItemType.WEAPON: {
                        await this.handleWeaponItem(i)
                        break
                    }
                    case ItemType.GEAR:
                    case ItemType.OTHER:
                    case undefined: {
                        if (i.can_equip) {
                            if (i.name.toUpperCase().includes("BACKPACK")) {
                                await this.handleContainerItem(i)
                            }
                            else {
                                await this.handleToolItem(i)
                            }
                        }
                        else {
                            await this.handleSundryItem(i)
                        }
                        break
                    }
                }
            }
            console.info("Tagalong Item Creator: Item Creation Complete!")
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }

    private async handleAlchemyItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'alchemical',
            folder: game.folders?.getName(this.importsFolder)?.id,
            system: {
                description: item.notes,
                category: 'alchemy',
                damage: '',
                damageType: '',
                bulk: {
                    slots: 1,
                    quantity: 1
                },
                value: item.value
            }
        })
    }

    private async handleArmorItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'armor',
            folder: game.folders?.getName(this.importsFolder)?.id,
            system: {
                description: item.notes,
                category: 'armor',
                armorType: item.might_req <= 3 ? 'light' : (item.might_req <= 4 ? 'medium' : 'heavy'),
                rating: item.armor_rating,
                mightReq: item.might_req,
                material: Object.keys(lang.VGLITE.Metals)[item.material?.toLowerCase()] ?? 'steel',
                bulk: {
                    slots: item.slots,
                    quantity: 1
                },
                isEquipped: item.is_eqiupped,
                value: item.value,
                relicEffects: []
            }
        })
    }

    private async handleWeaponItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'weapon',
            folder: game.folders?.getName(this.importsFolder)?.id,
            system: {
                description: item.notes,
                category: 'weapons',
                damage: {
                    oneHand: `1${item.damage}`,
                    twoHand: item.grip === 'V' ? `1d${Number(item.damage.replace('d', '')) + 2}` : `1${item.damage}`,
                    type: 'physical'
                },
                range: item.range?.toLowerCase(),
                grip: {
                    style: item.grip.toUpperCase() === '1H' ? 'H' : (item.grip.toUpperCase() === '2H' ? 'HH' : item.grip.toUpperCase()),
                    state: ''
                },
                properties: item.properties?.map(p => p.toLowerCase()),
                material: Object.keys(lang.VGLITE.Metals)[item.material?.toLowerCase()] ?? 'steel',
                bulk: {
                    slots: item.slots,
                    quantity: 1
                },
                isEquipped: item.is_eqiupped,
                value: item.value,
                relicEffects: []
            }
        })
    }

    private async handleContainerItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'container',
            folder: game.folders?.getName(this.importsFolder)?.id,
            system: {
                description: item.notes,
                category: 'containers',
                bulk: {
                    slots: item.slots,
                    quantity: 1
                },
                value: item.value,
                relicEffects: []
            }
        })
    }

    private async handleToolItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'tool',
            folder: game.folders?.getName(this.importsFolder)?.id,
            system: {
                description: item.notes,
                category: Object.keys(lang.VGLITE.EquipmentCategories)[item.category?.toLowerCase()] ?? 'other',
                value: item.value,
                bulk: {
                    slots: item.slots,
                    quantity: 1,
                    isStackable: true,
                    stackSize: 10
                }
            }
        })
    }

    private async handleSundryItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'sundry',
            folder: game.folders?.getName(this.importsFolder)?.id,
            system: {
                description: item.notes,
                category: Object.keys(lang.VGLITE.EquipmentCategories)[item.category?.toLowerCase()] ?? 'other',
                value: item.value,
                bulk: {
                    slots: item.slots,
                    quantity: 1,
                    isStackable: true,
                    stackSize: 10
                }
            }
        })
    }

    /**
     * Creates the item in the game system, then adds it to the character.
     * @param systemItem
     */
    private async createAndAddItem(systemItem: any) {
        try {
            return await Item.create(systemItem)
        }
        catch (e) {
            this.errors.push(`Item creation failure: ${systemItem.name}`)
        }
    }
}

/**
 * Item types available in the Tagalong app.
 */
enum ItemType {
    ARMOR = "Armor",
    WEAPON = "Weapon",
    ALCHEMY = "Alchemy",
    MEDICINE = "Alchemy & Medicine",
    GEAR = "Gear",
    OTHER = ""
}