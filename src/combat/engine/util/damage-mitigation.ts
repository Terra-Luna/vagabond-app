import { physicalDamageTypes } from "../../../model/common/shared-schemas"
import { getTargetActor } from "../../../util/model-util"
import type { DamageRoll } from "../roll/DamageRoll"
import { HuntersMark } from "./HuntersMark"

export interface AttackResolutionArgs {
  isSpellAttack?: boolean
  bypassArmor?: boolean
  gmTargetsOnly?: boolean
  damageOverrides?: Record<string, number>
}

export const damageOverrideKey = (targetId: string, subIndex = 0) =>
  `${subIndex}:${targetId}`

export interface ExtraDamage {
  damageRoll: DamageRoll
  bonus: number
  label?: string
}

export interface DamageBreakdown {
  damageBeforeHalving: number
  damage: number
  imbueDamage: number
  imbueParts: {
    dmgType: string
    amount: number
    bonus: number
    label?: string
  }[]
  resistanceDivisor: number
  armor: number
  armorPiercing: number
  otherMitigation: number
  mitigatedBeforeSave: number
  saveHalved: boolean
  mitigated: number
}

export interface TargetDamageSummary extends DamageBreakdown {
  targetId: string
  subIndex: number
  label?: string
  dmgType: string
  bonus: number
  total: number
  calculatedTotal: number
  isOverridden: boolean
  healing?: { flat: number; perDie: number; setValue: number }
}

export const isImmuneToStatus = (
  actor: Actor | null | undefined,
  status: string,
): boolean => {
  const immunities: string[] =
    (actor?.system as any)?.modifiers?.damage?.in?.statusImmunities ?? []
  return immunities.includes(status)
}

export const isImmuneToDamage = (
  targetId: string,
  damageRoll?: DamageRoll,
  isCast?: boolean,
): boolean => {
  const immunities =
    (getTargetActor(targetId)?.system as any)?.modifiers?.damage?.in
      ?.immunities ?? []
  const isPhysical = physicalDamageTypes().includes(damageRoll?.dmgType ?? "")

  if (immunities.includes("magical") && isCast && !isPhysical) return true
  if (immunities.includes("physical") && isPhysical) return true

  return immunities.includes(damageRoll?.dmgType ?? "")
}

export const getBeingTypes = (actor: any): string[] =>
  [
    actor?.system?.beingType,
    actor?.system?.beingSubtype,
    actor?.system?.ancestry?.beingType,
    actor?.system?.ancestry?.beingSubtype,
  ].filter(Boolean)

/**
 * A target is "weak" if it's weaknesses modifier contains the attack's damage type or its being type matches the weapon's Bane power.
 */
export const isWeakToDamage = (
  targetId: string,
  damageRoll?: DamageRoll,
): boolean => {
  const actor = getTargetActor(targetId)
  const weaknesses: string[] =
    (actor?.system as any)?.modifiers?.damage?.in?.weaknesses ?? []
  if (!!damageRoll?.dmgType && weaknesses.includes(damageRoll.dmgType))
    return true

  const baneTypes = damageRoll?.baneTypes ?? []
  if (
    baneTypes.length > 0 &&
    getBeingTypes(actor).some((type) => baneTypes.includes(type))
  )
    return true

  return HuntersMark.isWeakToHunter(actor, damageRoll?.attackerId)
}

/**
 * Extra damage from the attacker's being-type modifiers (e.g. bonus vs. undead / hellspawn / etc...)
 * and from the damage roll's hit-dice multiplier (Visceral).
 */
export const calculateBonusDamage = (
  targetActor: any,
  sourceActor: any,
  damageRoll: DamageRoll | undefined,
): number => {
  const beingTypes = getBeingTypes(targetActor)

  let bonus = 0
  const actorMods = (sourceActor?.system as any)?.modifiers ?? {}
  const beingTypeMods = beingTypes
    .map((type) => actorMods.damage?.out?.global?.beingType?.[type])
    .filter(Boolean)
  if (beingTypeMods.length > 0) {
    bonus += Math.max(...beingTypeMods.map((mod) => mod.bonus.flat))
    bonus +=
      Math.max(...beingTypeMods.map((mod) => mod.bonus.perDie)) *
      (damageRoll?.result?.rollSummaries.length ?? 0)
  }
  if (
    damageRoll?.hdMultiplier ||
    (damageRoll?.hdMultiplierOnCrit && damageRoll.result?.isCrit)
  ) {
    const targetHD =
      targetActor?.system?.hitDice ?? targetActor?.system?.level?.current ?? 0
    bonus +=
      targetHD *
      (damageRoll.hdMultiplier +
        (damageRoll.result?.isCrit ? damageRoll.hdMultiplierOnCrit : 0))
  }
  return bonus
}

export const buildSummaryRow = (
  targetId: string,
  subIndex: number,
  breakdown: DamageBreakdown,
  bonus: number,
  args: AttackResolutionArgs,
  dmgType: string,
  label?: string,
): TargetDamageSummary => {
  const totalBeforeSave = breakdown.mitigatedBeforeSave + bonus
  const calculatedTotal = breakdown.saveHalved
    ? Math.floor(Math.max(0, totalBeforeSave) / 2)
    : totalBeforeSave
  const override = args.damageOverrides?.[damageOverrideKey(targetId, subIndex)]
  const isOverridden = override !== undefined
  return {
    targetId,
    subIndex,
    label,
    dmgType,
    ...breakdown,
    bonus,
    calculatedTotal,
    isOverridden,
    total: isOverridden ? Math.max(0, override) : calculatedTotal,
  }
}

/**
 * Shared damage mitigation (resistances, flat reduction, per-die reduction, armor) for any damage roll.
 */
export const computeDamageBreakdown = (
  damageRoll: DamageRoll | undefined,
  targetId: string,
  args: AttackResolutionArgs,
  additionalArmorRating = 0,
  halfDamage = false,
  extras: ExtraDamage[] = [],
): DamageBreakdown => {
  const aSys = getTargetActor(targetId)?.system as any

  const dmgType = damageRoll?.dmgType ?? ""
  const mods = aSys?.modifiers?.damage?.in ?? {}
  // Attack-type reduction (e.g. the Flanked bonus damage) only applies to the weapon's own damage, never to spells or imbues.
  const attackReduction =
    !args.isSpellAttack && damageRoll ? (mods?.flatReduction?.attack ?? 0) : 0
  const flatReduction =
    (mods?.flatReduction?.global ?? 0) +
    (args.isSpellAttack
      ? (mods?.flatReduction?.[dmgType] ?? 0)
      : attackReduction)
  const perDieReductionFor = (type: string) =>
    (mods?.perDieReduction?.global ?? 0) + (mods?.perDieReduction?.[type] ?? 0)
  const perDieReduction = perDieReductionFor(dmgType)
  const isResistant = mods?.resistances?.includes(dmgType)
  const weaknessDice = isWeakToDamage(targetId, damageRoll)
    ? (damageRoll?.result?.weaknessRolls ?? [])
    : []
  const weaknessDamage = weaknessDice.reduce((acc, it) => acc + it.result, 0)

  let perDieMit =
    ((damageRoll?.result?.rollSummaries ?? []).filter((it) => !it.rerolled)
      .length +
      weaknessDice.length) *
    Math.max(0, perDieReduction)

  // Resistance and a passed save each halve the damage.
  const totalDamage = (damageRoll?.result?.total ?? 0) + weaknessDamage
  const resistanceDivisor = isResistant ? 2 : 1
  const damage = Math.floor(totalDamage / resistanceDivisor)

  // Extra damage sources (e.g. imbued spells) are added in before any mitigation, each resisted by its own type.
  let imbueDamage = 0
  const imbueParts: DamageBreakdown["imbueParts"] = []
  for (const extra of extras) {
    const extraRoll = extra.damageRoll
    if (!extraRoll.result || isImmuneToDamage(targetId, extraRoll, true))
      continue

    const extraWeakDice = isWeakToDamage(targetId, extraRoll)
      ? (extraRoll.result.weaknessRolls ?? [])
      : []
    const extraTotal =
      extraRoll.result.total +
      extraWeakDice.reduce((acc, it) => acc + it.result, 0) +
      extra.bonus
    const amount = mods?.resistances?.includes(extraRoll.dmgType)
      ? Math.floor(extraTotal / 2)
      : extraTotal
    imbueDamage += amount
    imbueParts.push({
      dmgType: extraRoll.dmgType,
      amount,
      bonus: Math.min(extra.bonus, amount),
      label: extra.label,
    })
    perDieMit +=
      (extraRoll.result.rollSummaries.filter((it) => !it.rerolled).length +
        extraWeakDice.length) *
      Math.max(0, perDieReductionFor(extraRoll.dmgType))
  }

  const armorRating = aSys?.armor?.rating ?? 0
  const armorPiercing = damageRoll?.result?.armorPiercing ?? 0
  const armor = args.bypassArmor
    ? 0
    : Math.max(0, armorRating + additionalArmorRating - armorPiercing)
  const otherMitigation = flatReduction + perDieMit
  const mitigatedBeforeSave = Math.max(
    0,
    damage + imbueDamage - otherMitigation - armor,
  )
  return {
    damageBeforeHalving: totalDamage,
    damage,
    imbueDamage,
    imbueParts,
    resistanceDivisor,
    armor,
    armorPiercing,
    otherMitigation,
    mitigatedBeforeSave,
    saveHalved: halfDamage,
    mitigated: halfDamage
      ? Math.floor(mitigatedBeforeSave / 2)
      : mitigatedBeforeSave,
  }
}
