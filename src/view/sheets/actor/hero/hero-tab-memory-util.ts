import { sys_id } from "../../../../util/foundry-util"

const FLAG = "heroSheetTabs"

type TabMemory = Record<string, string>

/** Remembers, per user and per Hero, which tab of the Hero sheet was last active. */
export const readHeroTab = (actorId: string): string | undefined => {
  const memory = (game.user as any)?.getFlag(sys_id, FLAG) as
    | TabMemory
    | undefined
  return memory?.[actorId]
}

export const writeHeroTab = (actorId: string, tabId: string) => {
  const user = game.user as any
  if (!user || readHeroTab(actorId) === tabId) return
  const memory = (user.getFlag(sys_id, FLAG) as TabMemory | undefined) ?? {}
  user.setFlag(sys_id, FLAG, { ...memory, [actorId]: tabId })
}
