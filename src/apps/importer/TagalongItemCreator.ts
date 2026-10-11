import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { inventoryItemTypes } from "../../utils/modelUtil"
import { type RelicPower,RelicPowers } from "../vagabond-tools/relic/RelicPowers"
import { TagalongItem } from "./TagalongApi"

export class TagalongItemCreator {

    hero: HeroDataModel
    items: TagalongItem[]
    errors: string[]
    private current?: TagalongItem

    constructor(hero: HeroDataModel, items: TagalongItem[]) {
        this.hero = hero
        this.items = items
        this.errors = []
    }

    async convert() {
        if (this.items.length > 0) {
            for (const i of this.items) {
                console.info("Tagalong Item Creator: Creating item", i)
                this.current = i
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
            system: {
                description: item.notes,
                category: 'alchemy',
                damage: '',
                damageType: '',
                bulk: {
                    slots: 1,
                    quantity: item.quantity ?? 1
                },
                value: item.value
            }
        })
    }

    private async handleArmorItem(item: TagalongItem) {
        const material = Object.keys(appLang.Metals).find(key => key.toLowerCase() === item.material?.toLowerCase()) ?? 'steel'
        await this.createAndAddItem({
            name: item.name,
            type: 'armor',
            system: {
                description: item.notes,
                category: 'armor',
                armorType: item.might_req <= 3 ? 'light' : (item.might_req <= 4 ? 'medium' : 'heavy'),
                rating: item.armor_rating,
                mightReq: item.might_req,
                material,
                bulk: {
                    slots: item.slots,
                    quantity: item.quantity ?? 1
                },
                isEquipped: item.is_equipped ?? item.is_eqiupped ?? false,
                value: item.value,
                relicEffects: []
            }
        })
    }

    private async handleWeaponItem(item: TagalongItem) {
        const material = Object.keys(appLang.Metals).find(key => key.toLowerCase() === item.material?.toLowerCase()) ?? 'steel'
        await this.createAndAddItem({
            name: item.name,
            type: 'weapon',
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
                material,
                bulk: {
                    slots: item.slots,
                    quantity: item.quantity ?? 1
                },
                isEquipped: item.is_equipped ?? item.is_eqiupped ?? false,
                value: item.value,
                relicEffects: []
            }
        })
    }

    private async handleContainerItem(item: TagalongItem) {
        await this.createAndAddItem({
            name: item.name,
            type: 'container',
            system: {
                description: item.notes,
                category: 'containers',
                bulk: {
                    slots: item.slots,
                    quantity: item.quantity ?? 1
                },
                value: item.value,
                relicEffects: []
            }
        })
    }

    private async handleToolItem(item: TagalongItem) {
        const category = Object.keys(appLang.EquipmentCategories)
            .find(key => key.toLowerCase() === item.category?.toLowerCase()) ?? 'other'
        await this.createAndAddItem({
            name: item.name,
            type: 'sundry',
            system: {
                description: item.notes,
                category,
                value: item.value,
                isEquippable: true,
                isEquipped: item.is_equipped ?? item.is_eqiupped ?? false,
                bulk: {
                    slots: item.slots,
                    quantity: item.quantity ?? 1,
                    isStackable: true,
                    stackSize: 10
                }
            }
        })
    }

    private async handleSundryItem(item: TagalongItem) {
        const category = Object.keys(appLang.EquipmentCategories)
            .find(key => key.toLowerCase() === item.category?.toLowerCase()) ?? 'other'
        await this.createAndAddItem({
            name: item.name,
            type: 'sundry',
            system: {
                description: item.notes,
                category,
                value: item.value,
                bulk: {
                    slots: item.slots,
                    quantity: item.quantity ?? 1,
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
            this.applyRelicPowers(systemItem)
            await TagalongItemCreator.createActorItems(this.hero.parent, [systemItem])
        }
        catch (e) {
            this.errors.push(`Item creation failure: ${systemItem.name}: ${(e as Error).message}`)
        }
    }

    /**
     * The system item type that Tagalong relic powers can be applied to, if any.
     */
    private static relicItemType(item: TagalongItem): string | undefined {
        switch (item.type) {
            case ItemType.ARMOR: return 'armor'
            case ItemType.WEAPON: return 'weapon'
            case ItemType.GEAR:
            case ItemType.OTHER:
            case undefined:
                return item.name.toUpperCase().includes("BACKPACK") && item.can_equip ? undefined : 'sundry'
            default: return undefined
        }
    }

    /**
     * Maps the Tagalong item's relic power IDs onto the system's relic powers.
     */
    static resolveRelicPowers(item: TagalongItem): RelicPower[] {
        const itemType = TagalongItemCreator.relicItemType(item)
        if (!itemType || !item.relic_powers?.length) return []
        const available = RelicPowers.get(itemType)
        return item.relic_powers.flatMap(power => {
            const match = available.find(rel => rel.id === power?.id)
            return match ? [foundry.utils.deepClone(match)] : []
        })
    }

    static hasRelicPowers(item: TagalongItem): boolean {
        return TagalongItemCreator.resolveRelicPowers(item).length > 0
    }

    /**
     * Adds relic powers (and their numeric item modifiers) to the new item's data.
     */
    private applyRelicPowers(itemData: any) {
        const source = this.current
        if (!source) return
        const relics = TagalongItemCreator.resolveRelicPowers(source)
        relics.forEach(relic => {
            relic.power.modifiers?.forEach(mod => {
                (mod.selector ?? []).forEach(selector => {
                    const current = foundry.utils.getProperty(itemData, selector)
                    if (typeof current === 'number') foundry.utils.setProperty(itemData, selector, current + mod.value)
                })
            })
        })
        itemData.system.relicPowers = relics
    }

    /**
     * Creates items directly on the Actor (never in the world's Items). Users who can't
     * create items ask the active GM to do it through the socket.
     */
    static async createActorItems(actor: Actor, items: any[]) {
        if (game.user?.isGM || game.user?.can("ITEM_CREATE") || !game.users?.activeGM) {
            return actor.createEmbeddedDocuments("Item", items)
        }

        const requestId = foundry.utils.randomID()
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                pendingRequests.delete(requestId)
                reject(new Error("The GM did not respond to the item creation request."))
            }, 15000)
            pendingRequests.set(requestId, error => {
                clearTimeout(timeout)
                error ? reject(new Error(error)) : resolve()
            })
            game.socket?.emit(`system.${sys_id}`, {
                action: "createTagalongItems",
                requestId,
                user: game.user?.id,
                data: { actorId: actor.id, items }
            })
        })
    }

    /**
     * GM client: creates items requested by a user on an Actor they own.
     */
    static async handleIncomingItemCreation(packet: any) {
        const { actorId, items } = packet?.data ?? {}
        let error: string | undefined
        try {
            const requester = game.users?.get(packet.user)
            const actor = game.actors?.get(actorId)
            if (!requester || !actor || !actor.testUserPermission(requester, "OWNER")) {
                throw new Error("Not permitted to create items on this actor.")
            }
            const allowed = inventoryItemTypes()
            if (!Array.isArray(items) || items.some(it => !allowed.includes(it?.type))) {
                throw new Error("Invalid item data.")
            }
            await actor.createEmbeddedDocuments("Item", items)
        }
        catch (e) {
            error = (e as Error).message
        }
        game.socket?.emit(`system.${sys_id}`, {
            action: "createTagalongItemsResult",
            requestId: packet?.requestId,
            user: packet?.user,
            error
        })
    }

    static handleItemCreationResult(packet: any) {
        if (packet?.user !== game.user?.id) return
        pendingRequests.get(packet.requestId)?.(packet.error)
        pendingRequests.delete(packet.requestId)
    }
}

const pendingRequests = new Map<string, (error?: string) => void>()

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