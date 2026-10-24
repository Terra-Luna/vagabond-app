import { sys_id } from "../../utils/foundryUtils"
import { removeWhitespace } from "../../utils/stringUtil"
import { getRuleSelectors, normalizeSelector } from "./selector-util"

export const getRuleToggleState = (actor: Actor, itemId: string) =>
    actor.getFlag(sys_id, `ruleToggle_${itemId}`)

export const toggleItemRule = async (actor: Actor, item: any, stateOverride?: boolean) => {
    const itemId = item.id?.split('.').pop() || item._sourceId?.split('.').pop() || undefined
    if (!itemId) return

    const activeEffectFlag = removeWhitespace(`${item.name ?? item.parent.name}_${itemId}`)
    const state = stateOverride ?? getRuleToggleState(actor, itemId)

    if (state) {
        try {
            const effects = actor.effects.filter(it => it.flags?.[sys_id]?.[activeEffectFlag])
            if (effects.length > 0) {
                actor.deleteEmbeddedDocuments('ActiveEffect', effects.map(it => it.id as string))
            }
        }
        catch {
            console.warn(`${sys_id} | Failed to delete ActiveEffect for item: ${activeEffectFlag}`)
        }
    }
    else {
        const rules = item.rules ?? item.system.rules ?? []
        const buffs = rules.filter(rule => rule.toggleableEffect && !getRuleSelectors(rule).some(s => s.includes("flags.")))

        if (buffs.length > 0) {
            const data = {
                name: item.name ?? item.parent.name,
                img: item.img ?? item.parent.img,
                showIcon: 2,
                flags: { [sys_id]: { [activeEffectFlag]: true } },
                changes: [/* Intentionally left blank - this merely serves as a buff icon while the rules engine applies effects */]
            }
            await actor.createEmbeddedDocuments('ActiveEffect', [data])
        }
    }
    await actor.setFlag(sys_id, `ruleToggle_${itemId}`, !state)
    await syncToggledStatusEffects(actor, item, !state)
}

const syncToggledStatusEffects = async (actor: Actor, item: any, active: boolean) => {
    const rules = item.rules ?? item.system.rules ?? []

    for (const rule of rules) {
        if (rule.key !== "ToggleRule" || !rule.toggleableEffect) continue

        const statusNames = getRuleSelectors(rule)
            .map((it: string) => normalizeSelector(it))
            .filter((it: string) => it.startsWith("statuses.toggles."))
            .map((it: string) => it.split(".").pop() as string)

        for (const statusName of statusNames) {
            try {
                const existing = actor.effects.find(fx => fx.statuses?.has(statusName))
                if (active && !existing) {
                    const effect = await actor.toggleStatusEffect(statusName, { active: true })
                    if (effect && effect instanceof ActiveEffect) {
                        await effect.setFlag(sys_id, "appliedByRule", rule.id)
                    }
                }
                else if (!active && existing?.id && existing.getFlag(sys_id, "appliedByRule") === rule.id) {
                    await actor.deleteEmbeddedDocuments("ActiveEffect", [existing.id])
                }
            }
            catch (e) {
                console.warn(`${sys_id} | Failed to sync status effect ${statusName}`, e)
            }
        }
    }
}
