import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { HeroAttack } from "../engine/HeroAttack"
import { currentRoundKey } from "./focus-round"
import { FocusAreaExposure } from "./FocusAreaExposure"

/**
 * A Focused spell whose area is a surface. A token entering the area (once a round, and only once the Focus check
 * that its arrival owes is passed) takes the spell's On Enter damage and Active Effects, and every token still inside
 * when a round starts takes its On Stay ones. Both are free: they cost no mana and need no upkeep or Cast check of
 * their own. The very same On Enter damage is dealt to every target when the spell is cast.
 */
export class FocusSurface {

  static isActive(instance: FocusInstance): boolean {
    return (
      !!instance.delivery?.spell.surface?.enabled &&
      FocusAreaExposure.hasArea(instance)
    )
  }

  static hasAny(): boolean {
    return (game.actors?.contents ?? []).some(
      (a: any) =>
        a.type === "hero" &&
        FocusSpellUtil.instances(a).some((it) => FocusSurface.isActive(it)),
    )
  }

  /**
   * Ids of the tokens the surface affects: those the spell's auto-targeting preference selects (everyone, unless it is
   * an Aura set to a disposition). A caster is never hit by an area that follows them, nor is the Familiar an Aura is centered on.
   */
  static tokensIn(instance: FocusInstance): string[] {
    const tokens = FocusAreaExposure.autoPref(instance)
      ? FocusAreaExposure.targetsIn(instance)
      : FocusAreaExposure.occupantsOf(instance)
    const follow = instance.delivery?.area?.follow
    return tokens
      .filter((t) => !follow || t.document.actorId !== follow.actorId)
      .filter((t) => !follow?.tokenId || t.document.id !== follow.tokenId)
      .map((t) => t.document.id as string)
  }

  /** Deals one phase of the surface to the tokens (free, as its own chat card), tied to the Focus. */
  static async deal(
    actor: any,
    instance: FocusInstance,
    phase: "onEnter" | "onStay",
    tokenIds: string[],
  ) {
    if (!instance.delivery || !tokenIds.length) return
    await HeroAttack.dealSurface(
      actor,
      instance.delivery,
      phase,
      tokenIds,
      instance.id,
    )
  }

  /** The newcomers whose On Enter effects were waiting on the Focus check, which has now been passed. */
  static async applyPending(actor: any, instance: FocusInstance) {
    await FocusSurface.deal(
      actor,
      instance,
      "onEnter",
      instance.surfacePendingIds ?? [],
    )
  }

  /**
   * Whether the Focus check owed this round is still unpaid. Nothing is owed outside combat, which has no upkeep.
   */
  private static isCheckOwed(instance: FocusInstance, key: string): boolean {
    const combat = game.combat as any
    if (!combat?.started) return false
    const castThisRound =
      instance.combatId === combat.id && instance.round === combat.round
    const settled =
      instance.lateKey === key
        ? instance.paidKey === key
        : castThisRound || instance.paidKey === key
    return !settled && FocusAreaExposure.isExposed(instance)
  }

  /**
   * A token moved (or the area did): whoever is in the area now that was not before this round takes On Enter, now or
   * as soon as the Focus check its arrival owes is passed.
   */
  static async onMove(actor: any, instance: FocusInstance) {
    if (!FocusSurface.isActive(instance)) return
    const key = currentRoundKey()
    const inside = FocusSurface.tokensIn(instance)
    if (instance.surfaceKey !== key) {
      // The round's start hasn't recorded who was already here, so nobody counts as an arrival.
      await FocusSpellUtil.update(actor, instance.id, {
        surfaceKey: key,
        surfaceIds: inside,
      })
      return
    }
    const known = instance.surfaceIds ?? []
    const arrivals = inside.filter((id) => !known.includes(id))
    if (!arrivals.length) return
    const owed = FocusSurface.isCheckOwed(instance, key)
    await FocusSpellUtil.update(actor, instance.id, {
      surfaceIds: [...known, ...arrivals],
      ...(owed && {
        surfacePendingIds: [
          ...new Set([...(instance.surfacePendingIds ?? []), ...arrivals]),
        ],
      }),
    })
    if (!owed) await FocusSurface.deal(actor, instance, "onEnter", arrivals)
  }

  /**
   * A round has started (GM): everyone still in the area takes On Stay, outside of upkeep, and becomes the baseline
   * that this round's arrivals are told apart from.
   */
  static async startOfRound() {
    if (!game.user?.isActiveGM || !canvas?.ready) return
    const key = currentRoundKey()
    for (const hero of game.actors?.contents ?? []) {
      if ((hero as any).type !== "hero") continue
      for (const instance of FocusSpellUtil.instances(hero)) {
        if (!FocusSurface.isActive(instance)) continue
        const inside = FocusSurface.tokensIn(instance)
        await FocusSpellUtil.update(hero, instance.id, {
          surfaceKey: key,
          surfaceIds: inside,
          surfacePendingIds: undefined,
        })
        await FocusSurface.deal(hero, instance, "onStay", inside)
      }
    }
  }

}
