import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { isInventoryItem } from "../../model/actor/type/Inventory"
import { VgLiteError}  from "../../model/common/VgLiteError"
import { applyAncestralTraits } from "../../model/item/character/AncestryDataModel"
import { updateDocument } from "../../utils/documentUtils"
import { stackStackables } from "../../utils/heroInventoryUtil"
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
                currentLuck: res.current_luck,
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
            fatigue: res.fatigue,
            studied: res.studied_dice
        })

        /**
         * Lookup matching Ancestry...
         */
        const ancestry = game.items?.find((it: any) =>
            it.type === 'ancestry' && it.name.toUpperCase() === res.ancestry.toUpperCase()
        ) as any
        if (!ancestry) {
            failures.push(`Ancestry: ${res.ancestry}`)
        }

        /**
         * Lookup matching Class.
         */
        const clazz = game.items?.find((it: any) =>
            it.type === 'class' && it.name.toUpperCase() === res.class.toUpperCase()
        ) as any
        if (!clazz) {
            failures.push(`Class: ${res.class}`)
        }

        /**
         * Lookup matching Perks...
         */
        const perks: any[] = []
        res.selected_perks.forEach(p => {
            const perk = game.items?.find((it: any) =>
                it.type === 'perk' && it.name.toUpperCase() === p.name.toUpperCase()
            )
            if (perk == undefined) {
                failures.push(`Perk: ${p.name}`)
            }
            else {
                perks.push(perk)
            }
        })

        /**
         * Lookup matching Spells...
         */
        const spells: any[] = []
        res.known_spells.forEach(s => {
            const systemSpell = game.items?.find((it: any) =>
                it.type === 'spell' && it.name.toUpperCase() === s.toUpperCase()
            )
            if (systemSpell == undefined) {
                failures.push(`Spell: ${s}`)
            }
            else {
                spells.push(systemSpell)
            }
        })

        /**
         * Add complex objects and arrays as Embedded Documents...
         */
        if (ancestry != undefined) {
            await hero.parent.createEmbeddedDocuments("Item", [ancestry])
            const heroAncestry = hero.parent.items.find((i: { type: string }) => i.type === 'ancestry')
            if (res.strongPotentialStat != null) {
                await updateDocument(heroAncestry, {
                    'traits': [
                        {
                            name: 'Strong Potential',
                            description: 'Increase one of your Stats by 1, but no higher than 7.',
                            modifiers: [{
                                targetStat: res.strongPotentialStat, type: 'BONUS', value: '1'
                            }]
                        }
                    ],
                })
            }
            if (res.ancestry_bonus_skill != null) {
                await updateDocument(heroAncestry, {
                    'chosenTrainings': [res.ancestry_bonus_skill]
                })
            }
            if (res.ancestry_bonus_spell != null) {
                await updateDocument(heroAncestry, {
                    'chosenSpells': [res.ancestry_bonus_spell]
                })
            }
            /**
             * Finalize ancestry by applying active effects.
             */
            applyAncestralTraits(heroAncestry.system)
        }

        if (clazz != undefined) {
            await hero.parent.createEmbeddedDocuments("Item", [clazz])
        }

        if (perks.length > 0) {
            await hero.parent.createEmbeddedDocuments("Item", perks)
        }

        if (spells.length > 0) {
            await hero.parent.createEmbeddedDocuments("Item", spells)
        }

        /**
         * Import character inventory...
         * First, check for any incoming new items and create them.
         * Second, collect all matching items from the system 
         */
        const newItems: TagalongItem[] = []
        res.inventory.forEach(tagalongItem => {
            const systemItem = game.items?.find(it => it.name.toUpperCase() === tagalongItem.name.toUpperCase())
            if (systemItem == undefined && newItems.map(it => it.name.toUpperCase()).indexOf(tagalongItem.name.toUpperCase()) == -1) {
                newItems.push(tagalongItem)
            }
        })
        const converter = new TagalongItemCreator(hero, newItems)
        await converter.convert()
        converter.errors.forEach(e => { failures.push(e) })

        const createAllItems = res.inventory.map(async tagalongItem => {
            const sysItem = game.items?.find(it => it.name.toUpperCase() === tagalongItem.name.toUpperCase() && isInventoryItem(it))
            if (sysItem) {
                await hero.parent.createEmbeddedDocuments("Item", [sysItem])
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
    return new VgLiteError({
        name: 'TAGALONG_API_ERROR', message: message
    })
}