import { useState } from "react"

import { FOLLOWER_HERO_FLAG, FOLLOWER_SKILL_FLAG } from "../../../../../model/actor/util/NpcDataModelUtil"
import { sys_id } from "../../../../../utils/foundryUtils"
import { appLang } from "../../../../../utils/lang"
import { DropDown } from "../../../../component/Dropdown"
import { useFoundryHook } from "../../../../wrappers/hooks"

const followerFlag = FOLLOWER_HERO_FLAG
const followerSkillFlag = FOLLOWER_SKILL_FLAG

/**
 * Heroes owned by an active player.
 */
const getSelectableHeroes = (): Actor[] => {
    const heroes = game.actors?.filter(it => (it.type as any) === "hero") ?? []
    if (game.user?.isGM) return heroes

    const activePlayers = game.users?.filter(user => user.active && !user.isGM) ?? []
    return heroes.filter(hero => activePlayers.some(user => hero.testUserPermission(user, "OWNER")))
}

export const FollowerSettings = ({ actor }: { actor: Actor }) => {
    const [, setRevision] = useState(0)

    useFoundryHook("updateActor" as any, (doc: any) => {
        if (doc.id === actor.id) setRevision(prev => prev + 1)
    })

    const heroId = (actor.getFlag(sys_id, followerFlag as any) as string | undefined) ?? ''
    const skill = (actor.getFlag(sys_id, followerSkillFlag as any) as string | undefined) ?? ''

    const heroOptions = getSelectableHeroes().map(hero => ({ label: hero.name ?? '', value: hero.id ?? '' }))
    const selectedHero = game.actors?.get(heroId)
    if (selectedHero && !heroOptions.some(it => it.value === heroId)) {
        heroOptions.push({ label: selectedHero.name ?? '', value: heroId })
    }

    const skillOptions = Object.entries(appLang.Skills).map(([key, entry]) => ({ label: (entry as any).name, value: key }))

    const setFlag = (flag: string, value: string) =>
        value
            ? actor.setFlag(sys_id, flag as any, value)
            : actor.unsetFlag(sys_id, flag as any)

    return (
        <div className="flex justify-between items-center gap-x-2 w-full">
            <div className="flex gap-x-1 items-center">
                <div className="text-base text-text-header-tertiary font-paradigm font-normal">{appLang.NpcSheet.follower}:</div>
                <DropDown
                    value={heroId}
                    options={heroOptions}
                    includeNullOption={true}
                    updateMechanism={{
                        onChange: async (value: string) => {
                            await setFlag(followerFlag, value)
                            if (value && !skill) await setFlag(followerSkillFlag, "leadership")
                        }
                    }}
                />
            </div>
            <div className="flex gap-x-1 items-center">
                <div className="text-base text-text-header-tertiary font-paradigm font-normal">{appLang.NpcSheet.followerSkill}:</div>
                <DropDown
                    value={skill}
                    options={skillOptions}
                    includeNullOption={true}
                    updateMechanism={{ onChange: (value: string) => setFlag(followerSkillFlag, value) }}
                />
            </div>
        </div>
    )
}
