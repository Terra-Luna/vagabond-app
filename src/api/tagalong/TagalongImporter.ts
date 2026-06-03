import HeroDataModel from "../../model/actor/HeroDataModel"
import VgLiteError from "../../model/common/VgLiteError"
import PerkDataModel from "../../model/item/character/PerkDataModel"
import SpellDataModel from "../../model/item/character/SpellDataModel"
import { updateDocument } from "../../utils/documentUtils"
import { fetchHero } from "./TagalongApi"

/**
 * Sample link: 
 *      (Orphenia) https://www.vgbnd.app/character/e38db88c-ec28-4b67-a44c-09f0fe199d01
 * Imports hero data from www.vgbnd.app and maps it to the system hero data model.
 * @param hero 
 * @param tagalongUrl 
 */
export const fetchAndUpdate = async (hero: HeroDataModel, tagalongUrl: string) => {
    try {
        const url = new URL(tagalongUrl)
        const res = (await fetchHero(url)).character

        /**
         * Build a list of failed item lookups.
         */
        let failures: string[] = []

        /**
         * Lookup matching Ancestry.
         */
        const ancestry = game.items?.find(it =>
            it.type === 'ancestry' &&
            it.name.toUpperCase() === res.ancestry.toUpperCase()
        )
        if (ancestry == undefined) {
            failures.push(`Ancestry: ${res.ancestry}`)
        }

        /**
         * Lookup matching Class.
         */
        const clazz = game.items?.find(it =>
            it.type === 'class' &&
            it.name.toUpperCase() === res.class.toUpperCase()
        )
        if (clazz == undefined) {
            failures.push(`Class: ${res.class}`)
        }

        /**
         * Lookup matching Perks.
         */
        const perks: PerkDataModel[] = []
        res.selected_perks.forEach(p => {
            const perk = game.items?.find(it =>
                it.type === 'perk' &&
                it.name.toUpperCase() === p.name.toUpperCase()
            )
            if (perk == undefined) {
                failures.push(`Perk: ${p.name}`)
            }
            else {
                perks.push(perk)
            }
        })

        /**
         * Lookup matching Spells.
         */
        const spells: SpellDataModel[] = []
        res.known_spells.forEach(s => {
            const spell = game.items?.find(it =>
                it.type === 'spell' &&
                it.name.toUpperCase() === s.toUpperCase()
            )
            if (spell == undefined) {
                failures.push(`Spell: ${s}`)
            }
            else {
                spells.push(spell)
            }
        })

        /**
         * Update the Hero's data model.
         */
        await updateDocument(hero.parent, {
            tagalongId: res.id,
            name: res.name,
            prototypeToken: { name: res.name },
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
                // TODO: decide whether we want to deal with importing items.
            },

            health: { current: res.current_hp },
            fatigue: res.fatigue,
            studied: res.studied_dice
        })

        /**
         * Add complex objects and arrays.
         */
        if (ancestry != undefined) {
            await hero.parent.createEmbeddedDocuments("Item", [ancestry])
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
         * Show any import failures.
         */
        if (failures.length > 0) {
            ui.notifications?.warn(`These attributes weren\'t able to be imported and will need to be configured manually...`)
            failures.forEach(f => {
                ui.notifications?.warn(f)
            })
        }
        else {
            ui.notifications?.success(`${res.name}'s info has been imported successfully.`)
        }
    }
    catch (e) {
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