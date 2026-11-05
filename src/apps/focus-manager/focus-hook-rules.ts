import { FOCUS_SPELLS_FLAG } from "../../model/actor/util/FocusSpellUtil"
import { sys_id } from "../../util/foundry-util"

const HOSTILE = -1

// Combat changes

export const isRoundChange = (changed: object) => "round" in changed

export const isTurnOrRoundChange = (changed: { turn?: unknown }) =>
  "turn" in changed || isRoundChange(changed)

/** A turn ended with no next turn (turn is null), or a new round began. */
export const endsTurnOrRound = (changed: { turn?: unknown }) =>
  isRoundChange(changed) || changed.turn === null

export const isHostileTurn = (combatant?: {
  token?: { disposition?: number }
}) => combatant?.token?.disposition === HOSTILE

// Token and actor changes

export const isHostile = (doc?: { disposition?: number }) =>
  doc?.disposition === HOSTILE

export const isMovement = (changed: object) =>
  "x" in changed || "y" in changed || "movement" in changed

export const changesFocusSpells = (changed: any) =>
  !!changed?.flags?.[sys_id] && FOCUS_SPELLS_FLAG in changed.flags[sys_id]
