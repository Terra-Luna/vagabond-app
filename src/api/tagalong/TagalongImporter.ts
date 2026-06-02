import HeroDataModel from "../../model/actor/HeroDataModel"
import VgLiteError from "../../model/common/VgLiteError"
import { updateDocument } from "../../utils/documentUtils"
import { fetchHero } from "./TagalongApi"

/**
 * Sample link: (Orphenia) https://www.vgbnd.app/character/e38db88c-ec28-4b67-a44c-09f0fe199d01
 * Imports hero data from www.vgbnd.app and maps it to the system hero data model.
 * @param hero 
 * @param tagalongUrl 
 */
export const fetchAndUpdate = async (hero: HeroDataModel, tagalongUrl: string) => {
    try {
        const url = new URL(tagalongUrl)
        const res = (await fetchHero(url)).character

        updateDocument(hero.parent, {
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

            /**
             * TODO: map ancestry & class.
             */

            /**
             * TODO: map perks & spells.
             */

            inventory: {
                coins: res.current_wealth
                /* TODO: decide whether we want to deal with importing items.
                container: {
                    items: [
                        ...map it
                    ]
                } */
            },

            health: { current: res.current_hp },
            fatigue: res.fatigue,
            studied: res.studied_dice,
        })
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