import { physicalDamageTypes } from "../../../model/common/shared-schemas"

const nonDamageTypes = ["healing", "mana"]

/** Burning of an absorbed damage type heals instead of damaging. */
export const absorbsBurning = (
  actor: Actor | null | undefined,
  damageType?: string,
): boolean => {
  if (!damageType || nonDamageTypes.includes(damageType)) return false
  const absorbs: string[] =
    (actor?.system as any)?.modifiers?.damage?.in?.absorbs ?? []
  return absorbs.includes(damageType)
}

export const isImmuneToBurning = (
  actor: Actor | null | undefined,
  damageType?: string,
): boolean => {
  if (!damageType || nonDamageTypes.includes(damageType)) return false
  if (absorbsBurning(actor, damageType)) return false
  const immunities: string[] =
    (actor?.system as any)?.modifiers?.damage?.in?.immunities ?? []
  return (
    immunities.includes(damageType) ||
    (immunities.includes("physical") &&
      physicalDamageTypes().includes(damageType))
  )
}

/**
 * Damage dealt by a single burning countdown roll after resistance (half, rounded down),
 * flat reduction, and per-die reduction. Per-die reduction is based on the number of dice,
 * not their individual results. According to Taron via a Discord message, flat
 * and per-die reductions should be applied to Burning damage.
 * Discussion: https://discord.com/channels/1347974074084888606/1541349723804409877/1566120397433217037
 */
export const mitigateBurningDamage = (
  actor: Actor,
  damageType: string | undefined,
  roll: number,
): number => {
  if (!damageType || nonDamageTypes.includes(damageType)) return roll
  if (absorbsBurning(actor, damageType)) return roll

  const mods = (actor.system as any)?.modifiers?.damage?.in ?? {}
  const flat =
    (mods.flatReduction?.global ?? 0) + (mods.flatReduction?.[damageType] ?? 0)
  const perDie =
    (mods.perDieReduction?.global ?? 0) +
    (mods.perDieReduction?.[damageType] ?? 0)
  const damage = mods.resistances?.includes(damageType)
    ? Math.floor(roll / 2)
    : roll

  return Math.max(0, damage - Math.max(0, flat) - Math.max(0, perDie))
}
