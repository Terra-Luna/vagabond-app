import lang from "../../../public/lang/en.json"
import HeroDataModel from "../../model/actor/HeroDataModel"
import { TagalongItem } from "./TagalongApi"

export default class TagalongItemCreator {

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
                console.log("Tagalong Item Creator: Creating folder:", this.importsFolder)
                await Folder.create({ name: this.importsFolder, type: "Item" })
            }
            for (const i of this.items) {
                console.log("Tagalong Item Creator: Creating item", i)
                switch (i.type) {
                    case ItemType.ALCHEMY: {
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
            console.log("Tagalong Item Creator: Item Creation Complete!")
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }

    private async handleAlchemyItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'alchemy',
            folder: game.folders?.getName(this.importsFolder)?.id,
            system: {
                description: item.notes,
                category: lang.VGLITE.EquipmentCategories.alchemy,
                damage: '',
                damageType: '',
                slots: 1,
                quantity: 1,
                isStackable: true,
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
                category: lang.VGLITE.EquipmentCategories.armor,
                armorType: item.might_req <= 3 ? 'light' : (item.might_req <= 4 ? 'medium' : 'heavy'),
                rating: item.armor_rating,
                mightReq: item.might_req,
                material: Object.values(lang.VGLITE.Metals)[item.material]?.name ?? lang.VGLITE.Metals.standard.name,
                slots: item.slots,
                quantity: 1,
                isEquippable: true,
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
                category: lang.VGLITE.EquipmentCategories.weapon,
                damage: {
                    oneHand: `1${item.damage}`,
                    twoHand: item.grip === 'V' ? `1d${Number(item.damage.replace('d', '')) + 2}` : `1${item.damage}`
                },
                range: lang.VGLITE.Ranges[item.range.toLowerCase()],
                grip: {
                    style: item.grip.toUpperCase(),
                    state: item.active_grip?.toUpperCase() ?? ''
                },
                properties: item.properties,
                material: Object.values(lang.VGLITE.Metals)[item.material]?.name ?? lang.VGLITE.Metals.standard.name,
                slots: item.slots,
                quantity: 1,
                isEquippable: true,
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
                category: lang.VGLITE.EquipmentCategories.containers,
                slots: item.slots,
                quantity: 1,
                isStackable: true,
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
                category: Object.values(lang.VGLITE.EquipmentCategories)[item.category] ?? lang.VGLITE.EquipmentCategories.other,
                value: item.value,
                slots: item.slots,
                quantity: 1,
                isEquippable: true
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
                category: Object.values(lang.VGLITE.EquipmentCategories)[item.category] ?? lang.VGLITE.EquipmentCategories.other,
                slots: item.slots,
                quantity: 1,
                isStackable: true,
                value: item.value,
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
    ALCHEMY = "Alchemy & Medicine",
    GEAR = "Gear",
    OTHER = ""
}