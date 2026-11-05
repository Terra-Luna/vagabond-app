import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { getFollowerContext } from "../../../model/actor/util/npc-data-model-util"
import { appLang } from "../../../util/lang"
import { getTargetActor } from "../../../util/model-util"
import type { SavingThrowType } from "../AdversaryAttack"
import { HeroAttack } from "../HeroAttack"
import { buildManualSaveResult, SkillCheck, SkillCheckResult } from "../roll/SkillCheck"

export interface SaveState {
  saveTypes: SavingThrowType[]
  halfDamageOnSave: boolean
  saveResults: Record<string, SkillCheckResult>
  defenseArmorBonuses: Record<string, number>
  rerolledSaveTargetIds: string[]
}

// Defend is offered whenever a Reflex save is allowed.
export const isSaveAllowed = (
  state: SaveState,
  saveType: SavingThrowType,
): boolean =>
  saveType === "defend"
    ? state.saveTypes.includes("reflex")
    : state.saveTypes.includes(saveType)

/**
 * A target who succeeded (or crit) their saving throw takes no damage. A defense check never
 * negates damage outright; it only adds armor.
 */
export const isDamagedAfterSave = (
  state: SaveState,
  targetId: string,
): boolean => {
  if (state.defenseArmorBonuses[targetId] !== undefined) return true
  const result = state.saveResults[targetId]
  return (
    !result ||
    result.outcome === appLang.RollResult.failure ||
    (result.outcome === appLang.RollResult.success && state.halfDamageOnSave)
  )
}

export const isHalvedBySave = (state: SaveState, targetId: string): boolean =>
  state.halfDamageOnSave &&
  state.defenseArmorBonuses[targetId] === undefined &&
  state.saveResults[targetId]?.outcome === appLang.RollResult.success

const setSaveResult = (
  state: SaveState,
  targetId: string,
  result: SkillCheckResult,
) => {
  state.saveResults = { ...state.saveResults, [targetId]: result }
}

const setDefenseArmor = (
  state: SaveState,
  targetId: string,
  armorBonus: number,
) => {
  state.defenseArmorBonuses = {
    ...state.defenseArmorBonuses,
    [targetId]: armorBonus,
  }
}

const clearDefenseArmor = (state: SaveState, targetId: string) => {
  state.defenseArmorBonuses = Object.fromEntries(
    Object.entries(state.defenseArmorBonuses).filter(([id]) => id !== targetId),
  )
}

export async function rollTargetSave(
  state: SaveState,
  targetId: string,
  saveType: SavingThrowType,
  clickEvent?: React.MouseEvent,
): Promise<SkillCheckResult | undefined> {
  if (!isSaveAllowed(state, saveType) || state.saveResults[targetId]) return

  const targetActor = getTargetActor(targetId)
  if (!targetActor) return

  const follower = getFollowerContext(targetActor)
  const hero = (follower?.hero ?? targetActor).system as HeroDataModel

  let result: SkillCheckResult
  if (follower) {
    result = await new SkillCheck(hero, {
      type: "save",
      skill: follower.skill,
      clickEvent: clickEvent as any,
    }).roll()
  }
  else if (saveType === "defend") {
    const defense = await HeroAttack.rollDefense(hero, { clickEvent })
    if (!defense) return
    result = defense.result
    setDefenseArmor(state, targetId, defense.armorBonus)
  }
  else {
    result = await new SkillCheck(hero, {
      type: "save",
      skill: saveType,
      clickEvent: clickEvent as any,
    }).roll()
  }

  setSaveResult(state, targetId, result)
  return result
}

/**
 * Records a save rolled elsewhere (e.g. the Hero sheet). A failed save may be replaced once.
 */
export function recordTargetSave(
  state: SaveState,
  targetId: string,
  saveType: SavingThrowType,
  result: SkillCheckResult,
  armorBonus?: number,
): boolean {
  if (!isSaveAllowed(state, saveType)) return false

  const existing = state.saveResults[targetId]
  if (existing) {
    if (
      existing.outcome !== appLang.RollResult.failure ||
      state.rerolledSaveTargetIds.includes(targetId)
    )
      return false
    state.rerolledSaveTargetIds = [...state.rerolledSaveTargetIds, targetId]
    clearDefenseArmor(state, targetId)
  }

  if (saveType === "defend") setDefenseArmor(state, targetId, armorBonus ?? 0)
  setSaveResult(state, targetId, result)
  return true
}

/**
 * GM override: sets (or replaces) a target's save outcome.
 */
export function overrideTargetSave(
  state: SaveState,
  targetId: string,
  outcome: string,
) {
  const skill = state.saveTypes.find((type) => type !== "defend") ?? "reflex"
  setSaveResult(state, targetId, buildManualSaveResult(skill, outcome))
  clearDefenseArmor(state, targetId)
}

/**
 * Spends a Luck to reroll a failed save with the same skill as the original attempt.
 * Only one reroll per target is allowed; GMs can override the outcome directly if needed.
 */
export async function rerollTargetSave(
  state: SaveState,
  targetId: string,
): Promise<SkillCheckResult | undefined> {
  const existing = state.saveResults[targetId]
  if (
    !existing ||
    existing.outcome !== appLang.RollResult.failure ||
    state.rerolledSaveTargetIds.includes(targetId)
  )
    return

  const targetActor = getTargetActor(targetId)
  if (!targetActor) return

  const luckActor = getFollowerContext(targetActor)?.hero ?? targetActor
  const hero = luckActor.system as HeroDataModel
  const luck = hero.statuses?.counters?.luck ?? 0
  if (luck <= 0) return

  await luckActor.update(
    { "system.statuses.counters.luck": luck - 1 } as Record<string, number>,
    { ["skipTrackerChatCard" as string]: true },
  )

  const favorHinder = existing.favorHinder as "favor" | "hinder" | "none"

  let result: SkillCheckResult
  if (state.defenseArmorBonuses[targetId] !== undefined) {
    const defense = await HeroAttack.rollDefense(hero, { favorHinder })
    if (!defense) return
    result = defense.result
    setDefenseArmor(state, targetId, defense.armorBonus)
  }
  else {
    result = await new SkillCheck(hero, {
      type: "save",
      skill: existing.skill,
      favorHinder,
    }).roll()
  }
  setSaveResult(state, targetId, result)
  state.rerolledSaveTargetIds = [...state.rerolledSaveTargetIds, targetId]

  return result
}
