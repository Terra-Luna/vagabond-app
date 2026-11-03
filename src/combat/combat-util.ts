import { CountdownManager } from "../apps/vagabond-tools/usecase/CountdownManager"
import { VagabondCombatant } from "./documents/VagabondCombat"

export const getControlledTokens = () =>
  game.canvas?.tokens?.controlled?.filter((t) => t.combatant) ??
  ([] as unknown as Token[])
export const getControlledCombatants = () =>
  (getControlledTokens().map((t) => t.combatant!) ??
    []) as unknown as VagabondCombatant[]

export const combineCombatantWithControlledCombatants = (
  ...additionalCombatants: VagabondCombatant[]
) => {
  const allCombatants = new Set(getControlledCombatants())
  if (additionalCombatants?.length) {
    additionalCombatants.forEach((comb) => allCombatants.add(comb))
  }

  return [...allCombatants]
}

export const performAsyncActionOnControlledCombatants = async (
  action: (combatant: VagabondCombatant) => Promise<any> | null | undefined,
  ...additionalCombatants: VagabondCombatant[]
) => {
  return await performAsyncActionOnCombatants(
    [...combineCombatantWithControlledCombatants(...additionalCombatants)],
    action,
  )
}

export const performAsyncActionOnCombatants = async (
  combatants: VagabondCombatant[],
  action: (combatant: VagabondCombatant) => Promise<any> | null | undefined,
) => {
  for (const combatant of combatants) {
    await action(combatant)
  }
}

/**
 * Let's the GM advance thru combatants. Opens adversary sheets automatically for hostile combatants.
 */
export const nextCombatant = async () => {
  const combat = game.combat as any
  if (!game.user?.isGM || !combat) return
  if (!combat.started) {
    await combat.startCombat()
    return
  }

  const groupOrder = ["heroes", "npcs", "adversaries"]
  const displayed = (combat.turns as any[]).filter((c) => c.actor)
  const ordered = groupOrder.flatMap((group) =>
    displayed.filter((c) => c.combatGroup === group),
  )

  const closeActorSheets = async () => {
    const sheets: any[] = Array.from(
      (foundry.applications.instances as Map<string, any>).values(),
    )
    await Promise.all(
      sheets
        .filter((app) => app.document?.documentName === "Actor")
        .map((app) => app.close()),
    )
  }

  const current = combat.combatant
  const startIndex = current
    ? ordered.findIndex((c) => c.id === current.id)
    : -1
  if (current) {
    await closeActorSheets()
    await combat.deactivateCombatant(current.id)
  }

  const next = ordered.find(
    (c, i) => i > startIndex && (c.activations?.value ?? 0) > 0,
  )
  if (!next) {
    await combat.nextRound()
    return
  }

  await CountdownManager.activateCombatantAndRollCountdowns(next)

  const token = next.token?.object as Token | undefined
  if (token) {
    await canvas?.animatePan({
      x: token.center.x,
      y: token.center.y,
      duration: 500,
    })
  }

  /**
   * Automatically opens the hostile combatant's sheet for the GM.
   */
  if (
    next.token?.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE &&
    next.actor
  ) {
    await closeActorSheets()
    next.actor.sheet?.render({ force: true })
  }
}

export const claimSpotlight = async () => {
  const combat = game.combat as any
  if (!combat?.started) return

  const token = canvas?.tokens?.controlled?.[0]
  const actor = token?.actor ?? game.user?.character
  const activeCombatant = combat.combatant

  // Ending the turn of any combatant the user owns takes priority.
  if (activeCombatant?.isOwner && !game.user?.isGM) {
    await combat.deactivateCombatant(activeCombatant.id)
    return
  }

  let combatant = (
    actor
      ? (token?.combatant ??
        combat.combatants.find(
          (c) => c.actorId === actor.id && (!token || c.tokenId === token.id),
        ) ??
        combat.combatants.find((c) => c.actorId === actor.id))
      : undefined
  ) as any

  // Players with multiple characters advance to the next one who has an activation left.
  if (
    (!combatant || !(combatant.activations?.value ?? 0)) &&
    !game.user?.isGM
  ) {
    combatant =
      combat.turns.find((c) => c.isOwner && (c.activations?.value ?? 0) > 0) ??
      combatant
  }
  if (!combatant) return

  if (activeCombatant?.id === combatant.id) {
    await combat.deactivateCombatant(combatant.id)
  }
  else if (!activeCombatant && (combatant.activations?.value ?? 0) > 0) {
    await CountdownManager.activateCombatantAndRollCountdowns(combatant)
  }
}
