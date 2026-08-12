import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { inventoryItemTypes } from "../../model/actor/type/Inventory"
import { VagabondAppError } from "../../model/common/VagabondAppError"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { updateDocument } from "../../utils/documentUtils"
import { stackStackables } from "../../utils/heroInventoryUtil"
import { addItemToActor, CombinedItems, CombinedItemsMultiType, TypedIndexEntry } from "../../utils/modelUtil"
import { fetchHero, TagalongItem } from "./TagalongApi"
import { TagalongItemCreator } from "./TagalongItemCreator"

/**
 * Sample link: 
 *      (Orphenia) https://www.vgbnd.app/character/e38db88c-ec28-4b67-a44c-09f0fe199d01
 * Imports hero data from www.vgbnd.app and maps it to the system hero data model.
 * 
 * TODO: update this to query for existing Items in our compendia instead
 *          --> const pack = game.packs.get(compendiumPackName)...
 * 
 * @param hero
 * @param tagalongUrl
 */
export const importHero = async (hero: HeroDataModel, tagalongUrl: string) => {
    try {
        ui.notifications?.info("Importing character data from www.vgbnd.app, please wait...")
        const url = new URL(tagalongUrl)
        const res = (await fetchHero(url)).character

        console.log(res)

        /**
         * Build a list of failed item lookups...
         */
        const failures: string[] = []

        /**
         * Update the Hero's data model...
         */
        await updateDocument(hero.parent, {
            tagalongId: res.id,
            name: res.name,
            prototypeToken: { name: res.name, actorLink: true },
            level: { current: res.level, xp: res.xp },

            stats: {
                might: res.assignedStats.might,
                dexterity: res.assignedStats.dexterity,
                awareness: res.assignedStats.awareness,
                reason: res.assignedStats.reason,
                presence: res.assignedStats.presence,
                luck: res.assignedStats.luck,
                baseStatBlock: res.statArray
            },

            skills: {
                brawl: { isTrained: isTrained('Brawl', res.trained_skills) },
                melee: { isTrained: isTrained('Melee', res.trained_skills) },
                finesse: { isTrained: isTrained('Finesse', res.trained_skills) },
                ranged: { isTrained: isTrained('Ranged', res.trained_skills) },
                arcana: { isTrained: isTrained('Arcana', res.trained_skills) },
                craft: { isTrained: isTrained('Craft', res.trained_skills) },
                detect: { isTrained: isTrained('Detect', res.trained_skills) },
                influence: { isTrained: isTrained('Influence', res.trained_skills) },
                leadership: { isTrained: isTrained('Leadership', res.trained_skills) },
                medicine: { isTrained: isTrained('Medicine', res.trained_skills) },
                mysticism: { isTrained: isTrained('Mysticism', res.trained_skills) },
                performance: { isTrained: isTrained('Performance', res.trained_skills) },
                sneak: { isTrained: isTrained('Sneak', res.trained_skills) },
                survival: { isTrained: isTrained('Survival', res.trained_skills) }
            },

            inventory: {
                coins: res.current_wealth
            },

            health: { current: res.current_hp },
            mana: { current: res.current_mana },
            statuses: {
                counters: {
                    luck: res.current_luck,
                    studied: res.studied_dice,
                    fatigue: res.fatigue
                }
            }
        })

        /**
         * Lookup matching Ancestry...
         */
        const ancestry = (await CombinedItems('ancestry')).find(it => it.name.toUpperCase() === res.ancestry.toUpperCase()) as any
        if (!ancestry) {
            failures.push(`Ancestry: ${res.ancestry}`)
        }

        /**
         * Lookup matching Class.
         */
        const clazz = (await CombinedItems('class')).find(it => it.name.toUpperCase() === res.class.toUpperCase()) as any
        if (!clazz) {
            failures.push(`Class: ${res.class}`)
        }

        /**
         * Lookup matching Perks...
         */
        const perks: (Item | TypedIndexEntry)[] = []
        for (const p of res.selected_perks) {
            const perk = ItemsCache.perks().find(it => it.name.toUpperCase() === p.name.toUpperCase())
            if (perk == undefined) {
                failures.push(`Perk: ${p.name}`)
            }
            else {
                perks.push(perk)
            }
        }

        /**
         * Lookup matching Spells...
         */
        const spells: (Item | TypedIndexEntry)[] = []
        for (const sp in res.known_spells) {
            const spell = ItemsCache.spells().find(it => it.name.toUpperCase() === sp.toUpperCase())
            if (spell == undefined) {
                failures.push(`Spell: ${sp}`)
            }
            else {
                spells.push(spell)
            }
        }

        if (ancestry) await hero.parent.createEmbeddedDocuments("Item", [ancestry])
        if (clazz) await hero.parent.createEmbeddedDocuments("Item", [clazz])

        spells.forEach(spell => {

        })

        perks.forEach(perk => {

        })

        /**
         * Import character inventory...
         * First, check for any incoming new items and create them.
         * Second, collect all matching items from the system 
         */
        const newItems: TagalongItem[] = []
        for (const tagalongItem of res.inventory) {
            const systemItem = (await CombinedItemsMultiType(inventoryItemTypes())).find(it => it.name.toUpperCase() === tagalongItem.name.toUpperCase())
            if (!systemItem && !newItems.map(it => it.name.toUpperCase()).includes(tagalongItem.name.toUpperCase())) {
                newItems.push(tagalongItem)
            }
        }
        const converter = new TagalongItemCreator(hero, newItems)
        await converter.convert()
        converter.errors.forEach(e => { failures.push(e) })

        const createAllItems = res.inventory.map(async tagalongItem => {
            const sysItem = (await CombinedItemsMultiType(inventoryItemTypes())).find(it => it.name.toUpperCase() === tagalongItem.name.toUpperCase())
            if (sysItem) {
                await addItemToActor(hero.parent, sysItem)
                await new Promise((resolve) => setTimeout(resolve, 1000))
                await stackStackables(hero)
            }
        })

        await Promise.all(createAllItems)
        await stackStackables(hero)

        /**
         * Show any import failures...
         */
        if (failures.length > 0) {
            ui.notifications?.warn("These items weren't able to be imported and will need to be configured manually...")
            failures.forEach(f => {
                ui.notifications?.warn(f)
            })
        }
        ui.notifications?.success(`${res.name}'s info has been imported!`)
    }
    catch (e) {
        console.log(e)
        throw tagalongError((e as Error).message)
    }
}

const isTrained = (skill: string, trainedSkills: string[]): boolean => {
    return trainedSkills.indexOf(skill) > -1
}

const tagalongError = (message: string) => {
    return new VagabondAppError({
        name: 'TAGALONG_API_ERROR', message: message
    })
}