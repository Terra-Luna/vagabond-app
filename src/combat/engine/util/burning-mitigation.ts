import { physicalDamageTypes } from "../../../model/common/sharedSchemas"

const nonDamageTypes = ["healing", "mana"]

export const isImmuneToBurning = (actor: Actor | null | undefined, damageType?: string): boolean => {
    if (!damageType || nonDamageTypes.includes(damageType)) return false
    const immunities: string[] = (actor?.system as any)?.modifiers?.damage?.in?.immunities ?? []
    return immunities.includes(damageType) || (immunities.includes("physical") && physicalDamageTypes().includes(damageType))
}

/**
 * Damage dealt by a single burning countdown roll after resistance (half, rounded down),
 * flat reduction, and per-die reduction. At this time, I don't know whether the flat or
 * per-die modifiers should be applied. I'm thinking 'no' since it's technically not a
 * "damage die".
 */
export const mitigateBurningDamage = (actor: Actor, damageType: string | undefined, roll: number): number => {
    if (!damageType || nonDamageTypes.includes(damageType)) return roll

    const mods = (actor.system as any)?.modifiers?.damage?.in ?? {}
    const flat = 0 /* (mods.flatReduction?.global ?? 0) + (mods.flatReduction?.[damageType] ?? 0) */
    const perDie = 0 /* (mods.perDieReduction?.global ?? 0) + (mods.perDieReduction?.[damageType] ?? 0) */
    const damage = mods.resistances?.includes(damageType) ? Math.floor(roll / 2) : roll

    return Math.max(0, damage - Math.max(0, flat) - Math.min(damage, Math.max(0, perDie)))
}
