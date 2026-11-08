import { getManaEnforcement } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import type { FocusInstance } from "../../model/actor/util/FocusSpellUtil"
import { HeroAttack } from "../engine/HeroAttack"
import type { SpellDelivery } from "./SpellDelivery"

/** Max damage dice the caster can afford to repeat (1 mana per die). */
export const maxRepeatDice = (actor: any): number => {
  const mana = actor.system.mana
  return getManaEnforcement()
    ? Math.max(0, Math.min(mana.value, mana.maxCast))
    : 99
}

/** The spell's delivery trimmed for a repeat: only its Burning is re-applied, tied to the same Focus. */
export const buildRepeatDelivery = (
  instance: FocusInstance,
  dice: number,
): SpellDelivery => {
  const snapshot = instance.delivery!
  const burning = (snapshot.spell.appliedEffects ?? []).filter(
    (e) => e.effect === "burning",
  )
  const reapply =
    snapshot.applyEffect && burning.length > 0 && !snapshot.spell.focusExempt
  const repeat = {
    ...snapshot,
    spell: {
      ...snapshot.spell,
      appliedEffects: burning,
      appliedActiveEffects: [],
      emitsLight: undefined,
    },
    area: undefined,
    isFocused: false,
    focusId: reapply ? instance.id : undefined,
    applyEffect: reapply,
    damageDice: dice,
    upcast: 0,
    discount: 0,
    _manaCost: dice,
  }

  // A plain object stands in for a configured delivery: the mana cost is one per die.
  return {
    ...repeat,
    studyDamageDice: 0,
    discount: 0,
    manaCost: dice,
    toJson: () => repeat,
  } as unknown as SpellDelivery
}

/** Deals a Focused spell's damage again at 1 mana per die, with no skill check and no new Focus. Resolves to the damage rolled, or undefined if nothing was sent. */
export const dealRepeatDamage = async (
  actor: any,
  instance: FocusInstance,
  dice: number,
  targetIds: string[],
): Promise<number | undefined> => {
  if (!instance.delivery || dice < 1 || !targetIds.length) return undefined

  const attack = HeroAttack.buildSpellAttack(
    actor,
    instance.skill ?? actor.system.class?.castingSkill ?? "arcana",
    buildRepeatDelivery(instance, dice),
    undefined,
    { skipSkillCheck: true },
  )
  if (!attack) return undefined
  attack.targetIds = [...targetIds]
  attack.requiresTargets = true
  await attack.initiate(undefined)
  return mitigatedTotal(attack)
}

/** Damage the targets actually take with default resolution (armor, resistances, immunities); GM overrides and saves are applied later on the chat card. */
const mitigatedTotal = (attack: HeroAttack): number => {
  const rows = attack.getDamageSummary({ isSpellAttack: true })
  if (!rows.length) return attack.damageRoll?.result?.total ?? 0
  return rows.filter((r) => !r.failed).reduce((sum, r) => sum + r.total, 0)
}
