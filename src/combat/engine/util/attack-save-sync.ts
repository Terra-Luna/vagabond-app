import { getAttackRegistry } from "../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { AdversaryAttack, SavingThrowType } from "../AdversaryAttack"
import { AdversaryComboAttack } from "../AdversaryComboAttack"
import type { SkillCheckResult } from "../roll/SkillCheck"
import { deserializeAttack } from "./attack-deserializer"

const SAVE_TYPES: string[] = ['reflex', 'endure', 'will']

/**
 * Sometimes, a player will roll a save directly from their sheet instead of the chat card which
 * makes the GM's job quite annoying. This will check for the lastest active attack and if the
 * Hero is a Target, it will slot the save into the interactive attack chat card.
 */
export async function recordSheetSaveOnActiveAttacks(hero: Actor, result: SkillCheckResult, defense?: { armorBonus: number }): Promise<boolean> {
    const saveType = defense ? 'defend' : result?.skill
    if (!defense && !SAVE_TYPES.includes(saveType)) return false

    const tokenIds = hero.getActiveTokens().map(token => token.id)
    if (tokenIds.length === 0) return false

    const candidates = Object.values(getAttackRegistry() as Record<string, any[]>)
        .flat()
        .filter(snapshot => !snapshot.isResolved && snapshot.type !== 'hero')
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

    let recorded = false
    for (const tokenId of tokenIds) {
        const latest = candidates.find(snapshot => (snapshot.targetIds as string[] ?? []).includes(tokenId))
        if (!latest) continue

        const attack = deserializeAttack(latest, () => undefined as never)
        if (!(attack instanceof AdversaryAttack || attack instanceof AdversaryComboAttack)) continue

        recorded = await attack.recordSaveResult(tokenId, saveType as SavingThrowType, foundry.utils.deepClone(result), defense?.armorBonus) || recorded
    }
    return recorded
}
