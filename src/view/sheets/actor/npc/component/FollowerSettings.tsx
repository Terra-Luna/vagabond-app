import { useState } from "react"

import { FAMILIAR_FLAG, FOLLOWER_HERO_FLAG, FOLLOWER_SKILL_FLAG } from "../../../../../model/actor/util/follower-flags"
import { sys_id } from "../../../../../util/foundry-util"
import { appLang } from "../../../../../util/lang"
import { Checkbox } from "../../../../component/Checkbox"
import { DropDown } from "../../../../component/Dropdown"
import { alwaysEditingContext, EditModeContext, useEditMode } from "../../../../context/EditModeContext/Hooks"
import { useFoundryHook } from "../../../../wrappers/hooks"

const followerFlag = FOLLOWER_HERO_FLAG
const followerSkillFlag = FOLLOWER_SKILL_FLAG

/**
 * Heroes owned by an active player.
 */
const getSelectableHeroes = (): Actor[] => {
  const heroes = game.actors?.filter((it) => (it.type as any) === "hero") ?? []
  if (game.user?.isGM) return heroes

  const activePlayers =
    game.users?.filter((user) => user.active && !user.isGM) ?? []
  return heroes.filter((hero) =>
    activePlayers.some((user) => hero.testUserPermission(user, "OWNER")),
  )
}

export const FollowerSettings = ({ actor }: { actor: Actor }) => {
  const [, setRevision] = useState(0)
  const { isEditMode } = useEditMode()
  useFoundryHook("updateActor" as any, (doc: any) => {
    if (doc.id === actor.id) setRevision((prev) => prev + 1)
  })
  // An unlinked token's changes arrive as an update to the token's delta.
  useFoundryHook("updateToken" as any, (doc: any, changed: any) => {
    if (actor.isToken && doc.id === actor.token?.id && "delta" in changed)
      setRevision((prev) => prev + 1)
  })

  const heroId =
    (actor.getFlag(sys_id, followerFlag as any) as string | undefined) ?? ""
  const skill =
    (actor.getFlag(sys_id, followerSkillFlag as any) as string | undefined) ??
    ""

  const heroOptions = getSelectableHeroes().map((hero) => ({
    label: hero.name ?? "",
    value: hero.id ?? "",
  }))
  const selectedHero = game.actors?.get(heroId)
  if (selectedHero && !heroOptions.some((it) => it.value === heroId)) {
    heroOptions.push({ label: selectedHero.name ?? "", value: heroId })
  }

  const skillOptions = Object.entries(appLang.Skills).map(([key, entry]) => ({
    label: (entry as any).name,
    value: key,
  }))

  const isFamiliar = !!actor.getFlag(sys_id, FAMILIAR_FLAG as any)

  /**
   * An unlinked token stores its changes as a delta over its base Actor, where a deleted flag can't hide a value the
   * base Actor still has. So there a flag is cleared by overwriting it with null, which every reader treats as unset.
   */
  const clearFlag = (flag: string) =>
    actor.isToken
      ? actor.setFlag(sys_id, flag as any, null)
      : actor.unsetFlag(sys_id, flag as any)

  const setFlag = (flag: string, value: string) =>
    value ? actor.setFlag(sys_id, flag as any, value) : clearFlag(flag)

  // An independent NPC only shows these inputs while editing, to let a Hero be chosen.
  if (!heroId && !isEditMode) return null

  return (
    <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 w-full">
      <div className="flex gap-x-1 items-center">
        <div className="text-base text-text-header-tertiary font-paradigm font-normal">
          {appLang.NpcSheet.follower}:
        </div>
        <DropDown
          value={heroId}
          options={heroOptions}
          includeNullOption={true}
          updateMechanism={{
            onChange: async (value: string) => {
              if (!value) {
                await Promise.all(
                  [followerFlag, followerSkillFlag, FAMILIAR_FLAG].map(clearFlag),
                )
                return
              }
              await setFlag(followerFlag, value)
              if (!skill) await setFlag(followerSkillFlag, "leadership")
            },
          }}
        />
      </div>
      {heroId && (
        <div className="flex gap-x-1 items-center">
          <div className="text-base text-text-header-tertiary font-paradigm font-normal">
            {appLang.NpcSheet.followerSkill}:
          </div>
          <DropDown
            value={skill}
            options={skillOptions}
            includeNullOption={true}
            updateMechanism={{
              onChange: (value: string) => setFlag(followerSkillFlag, value),
            }}
          />
        </div>
      )}
      {heroId && (
        <EditModeContext.Provider value={alwaysEditingContext}>
          <Checkbox
            label={appLang.NpcSheet.familiar}
            checked={isFamiliar}
            onCheckedChanged={(checked) =>
              checked
                ? actor.setFlag(sys_id, FAMILIAR_FLAG as any, true)
                : clearFlag(FAMILIAR_FLAG)
            }
          />
        </EditModeContext.Provider>
      )}
    </div>
  )
}
