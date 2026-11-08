import { StatusEffectUtil } from "./StatusEffectUtil"

/**
 * An actor immune to a status (modifiers.damage.in.statusImmunities) can't gain it, and loses it if it is
 * already on them when they become immune, whether the immunity was edited in, or came from a polymorph form,
 * a perk, a piece of equipment, an Active Effect...
 */
export class StatusImmunityUtil {

  /** Ids of the actor's status effects that it is now immune to. */
  static immuneEffectIds(actor: any): string[] {
    const immunities: string[] =
      actor?.system?.modifiers?.damage?.in?.statusImmunities ?? []
    if (!immunities.length) return []
    return (actor.effects?.contents ?? [])
      .filter((effect: any) =>
        [...(effect.statuses ?? [])].some((status: string) =>
          immunities.includes(status),
        ),
      )
      .map((effect: any) => effect.id as string)
  }

  /** Removes every status effect the actor is immune to. Only the designated user does so, once. */
  static async purge(actor: any) {
    if (!actor || !StatusEffectUtil.isDesignatedUser()) return
    const ids = StatusImmunityUtil.immuneEffectIds(actor)
    if (!ids.length) return
    const key = `${actor.uuid}:${ids.join(",")}`
    if (StatusImmunityUtil.purging.has(key)) return
    StatusImmunityUtil.purging.add(key)
    try {
      await actor.deleteEmbeddedDocuments("ActiveEffect", ids)
    }
    catch (error) {
      console.error("Failed to remove statuses the actor is immune to", error)
    }
    finally {
      StatusImmunityUtil.purging.delete(key)
    }
  }

  private static readonly purging = new Set<string>()
  private static readonly queued = new Map<
    string,
    ReturnType<typeof setTimeout>
  >()

  /** Checks after the current change has finished preparing the actor's data. */
  static schedule(actor: any) {
    if (!actor?.uuid) return
    clearTimeout(StatusImmunityUtil.queued.get(actor.uuid))
    StatusImmunityUtil.queued.set(
      actor.uuid,
      setTimeout(() => {
        StatusImmunityUtil.queued.delete(actor.uuid)
        StatusImmunityUtil.purge(actor)
      }, 50),
    )
  }

  /** Immunity can change with the actor, its items, its effects (or a polymorph's) and, for unlinked tokens, the token. */
  static registerHooks() {
    const ofParent = (doc: any) =>
      doc?.parent?.documentName === "Actor" ? doc.parent : undefined

    Hooks.on("updateActor", (actor: any) => StatusImmunityUtil.schedule(actor))
    Hooks.on("updateToken", (doc: any) =>
      StatusImmunityUtil.schedule(doc.actor),
    )
    for (const hook of ["create", "update", "delete"]) {
      Hooks.on(`${hook}Item` as any, (item: any) =>
        StatusImmunityUtil.schedule(ofParent(item)),
      )
      Hooks.on(`${hook}ActiveEffect` as any, (effect: any) =>
        StatusImmunityUtil.schedule(ofParent(effect)),
      )
    }
    Hooks.once("ready", () => {
      for (const actor of game.actors?.contents ?? [])
        StatusImmunityUtil.schedule(actor)
    })
    Hooks.on("canvasReady", () => {
      for (const token of canvas?.scene?.tokens?.contents ?? [])
        StatusImmunityUtil.schedule(token.actor)
    })
  }

}
