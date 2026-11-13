import { FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { AuraAnchorUtil } from "./aoe/AuraAnchorUtil"
import { TemporaryArea } from "./aoe/TemporaryArea"

/**
 * An Aura centered on a Familiar drops when the Familiar dies (or leaves the scene). The Focus on it ends, but its
 * effects on targets linger until the next round begins when in combat, and end right away otherwise. The area of an
 * Aura that was not Focused just ends. Only the active GM acts.
 */
export class FamiliarAura {

  private static queue: Promise<unknown> = Promise.resolve()

  static registerHooks() {
    const onDeadStatus = (effect: any) => {
      if (effect?.statuses?.has("dead")) FamiliarAura.sweep()
    }
    Hooks.on("createActiveEffect", onDeadStatus)
    Hooks.on("deleteToken", (doc: any) => FamiliarAura.sweep(doc?.id))
    Hooks.on("updateActor", (_actor: any, changed: any) => {
      if (foundry.utils.hasProperty(changed, "system.health.value"))
        FamiliarAura.sweep()
    })
    // An unlinked Familiar keeps its HP on the token rather than the actor.
    Hooks.on("updateToken", (_doc: any, changed: any) => {
      if (foundry.utils.hasProperty(changed, "delta.system.health.value"))
        FamiliarAura.sweep()
    })
  }

  /** Drops every Aura whose Familiar is down. Sweeps queue up so overlapping triggers never act on stale Focuses. */
  static sweep(removedTokenId?: string): Promise<unknown> {
    FamiliarAura.queue = FamiliarAura.queue
      .then(() => FamiliarAura.sweepNow(removedTokenId))
      .catch((error) => console.error("Failed to drop a Familiar's Aura", error))
    return FamiliarAura.queue
  }

  private static async sweepNow(removedTokenId?: string) {
    if (!game.user?.isActiveGM) return
    const isLost = (area: any) =>
      (!!removedTokenId && area?.follow?.tokenId === removedTokenId) ||
      AuraAnchorUtil.isLost(area)

    for (const hero of game.actors?.contents ?? []) {
      if ((hero.type as string) !== "hero") continue
      for (const instance of FocusSpellUtil.instances(hero)) {
        if (!isLost(instance.delivery?.area)) continue
        // Deferred in combat so the effects last until the next round starts; immediate out of combat.
        await FocusSpellUtil.drop(hero, instance.id, false, false, true)
      }
    }

    for (const scene of game.scenes ?? []) {
      for (const [attackId, area] of Object.entries(TemporaryArea.of(scene))) {
        const anchorId = area.anchorTokenId
        if (!anchorId) continue
        const token = scene.tokens.get(anchorId)
        if (anchorId === removedTokenId || AuraAnchorUtil.isDown(token))
          await TemporaryArea.remove(scene.id!, attackId)
      }
    }
  }

}
