import type { DamageRoll } from "../roll/DamageRoll"

/**
 * Adds an Adversary/NPC's outgoing damage modifiers (e.g. from Exalted) to one of its damage rolls.
 * Unlike Heroes, these aren't part of the dice formula, so they're applied right before rolling.
 */
export const applyAdversaryDamageMods = (actor: any, damageRoll: DamageRoll, isSpellAttack: boolean): { alwaysWeak: boolean } => {
    const out = actor?.system?.modifiers?.damage?.out
    if (!out) return { alwaysWeak: false }

    const scopes = [out.global, ...(isSpellAttack ? [out.spell] : [])].filter(Boolean)
    for (const scope of scopes) {
        damageRoll.flatDmgBonus += scope.bonus?.flat ?? 0
        damageRoll.perDieDmgBonus += scope.bonus?.perDie ?? 0
        damageRoll.hdMultiplier += scope.bonus?.hdMultiplier ?? 0
        damageRoll.armorPiercing += scope.armorPiercing?.flat ?? 0
        damageRoll.armorPiercingPerDie += scope.armorPiercing?.perDie ?? 0
        damageRoll.armorPiercingPerExtraDie += scope.armorPiercing?.perExtraDie ?? 0
    }

    return { alwaysWeak: scopes.some(scope => !!scope.conditional?.weak) }
}
