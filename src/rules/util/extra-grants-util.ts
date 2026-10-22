import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"

export const EXTRA_GRANTS_FLAG = "extraGrantsModsFeature"

let pendingCreation: Promise<any> | undefined

export const findExtraGrantsFeature = (actor: Actor | undefined): (Item & { system: any }) | undefined =>
    actor?.items.find((item: any) => item.type === "feature" && item.getFlag(sys_id, EXTRA_GRANTS_FLAG)) as any

export const getExtraPerkRules = (actor: Actor | undefined): any[] =>
    (findExtraGrantsFeature(actor)?.system.rules ?? []).filter((rule: any) => rule.key === "GrantItem" && rule.type === "perk")

const getOrCreateExtraGrantsFeature = async (actor: Actor): Promise<Item & { system: any }> => {
    const existing = findExtraGrantsFeature(actor)
    if (existing) return existing

    pendingCreation ??= actor.createEmbeddedDocuments("Item", [{
        name: appLang.HeroChoices.extraGrantsFeatureName,
        type: "feature",
        img: "icons/svg/d20-highlight.svg",
        system: {
            description: appLang.HeroChoices.extraGrantsFeatureDescription,
            level: 0,
            rules: []
        },
        flags: { [sys_id]: { [EXTRA_GRANTS_FLAG]: true } }
    }] as any).finally(() => { pendingCreation = undefined })

    await pendingCreation
    return findExtraGrantsFeature(actor)!
}

export const addExtraPerk = async (actor: Actor, perk: { uuid: string, name: string }) => {
    const feature = await getOrCreateExtraGrantsFeature(actor)
    const rules = foundry.utils.deepClone(feature.system.rules ?? [])
    rules.push({
        id: foundry.utils.randomID(),
        key: "GrantItem",
        label: perk.name,
        level: 0,
        type: "perk",
        uuid: perk.uuid
    })
    await feature.update({ "system.rules": rules } as any)
}

export const removeExtraPerkRule = async (actor: Actor, ruleId: string) => {
    const feature = findExtraGrantsFeature(actor)
    if (!feature) return
    await feature.update({ "system.rules": (feature.system.rules ?? []).filter((rule: any) => rule.id !== ruleId) } as any)
}