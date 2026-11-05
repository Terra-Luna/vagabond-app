import { ItemsCache } from "../../../rules/util/ItemsCache"
import { sys_id } from "../../../util/foundry-util"
import { appLang } from "../../../util/lang"
import type { AdversaryDataModel } from "../AdversaryDataModel"
import type { HeroDataModel } from "../HeroDataModel"
import type { NpcDataModel } from "../NpcDataModel"
import { FocusSpellUtil } from "./FocusSpellUtil"
import { StatusEffectUtil } from "./StatusEffectUtil"

export interface PolymorphFlag {
  casterId: string
  duration: "focus" | "continual" | "turn"
  statBlock: PolymorphStatBlock
  equipHistory?: (string | null)[]
  originalTokens?: Record<string, TokenSize>
}

export interface TokenSize {
  width: number
  height: number
  depth?: number
  scaleX: number
  scaleY: number
}

interface PolymorphStatBlock {
  id: string
  name: string
  tokenImg: string
  token?: TokenSize
  items: any[]
  system: NpcDataModel
}

export class PolymorphUtil {

  /**
   * The main function to call first when trying to polymorph something.
   * Requires either a caster and a form or just a target to release from polymorph.
   */
  static polymorph = async ({
    caster,
    targets,
    form,
    duration,
  }: {
    caster?: Actor & {
      system: HeroDataModel | NpcDataModel | AdversaryDataModel
    }
    targets: (Actor & {
      system: HeroDataModel | NpcDataModel | AdversaryDataModel
    })[]
    form?: Actor & { system: NpcDataModel | AdversaryDataModel }
    duration?: "focus" | "continual" | "turn"
  }) => {
    targets = (targets ?? []).filter(Boolean)
    if ((form && !caster) || targets.length === 0) return

    const canUpdateTargets = targets.every(
      (target) =>
        target.isOwner &&
        (target.getActiveTokens(false, true) as any[]).every((t) => t.isOwner),
    )

    if (!canUpdateTargets && !game.user?.isActiveGM) {
      if (!game.users?.activeGM) {
        ui.notifications?.warn(
          "A GM must be connected to polymorph or revert targets you don't own.",
        )
        return
      }
      /**
       * This socket is dedicated for allowing players to release their polymorph targets w/o GM intervention.
       */
      game.socket?.emit(`system.${sys_id}`, {
        action: "polymorph",
        data: {
          casterUuid: caster?.uuid,
          targetUuids: targets.map((t) => t.uuid),
          formUuid: form?.uuid,
          duration,
        },
      })
      return
    }

    let polymorphFlag: PolymorphFlag | undefined = undefined

    if (form) {
      polymorphFlag = {
        casterId: caster?.id,
        duration: duration,
        statBlock: {
          casterId: caster?.id,
          id: form.id,
          name: form.name,
          tokenImg:
            form.prototypeToken?.texture?.src ||
            form.prototypeToken?.ring?.subject?.texture ||
            form.img,
          token: PolymorphUtil.readTokenSize(form.prototypeToken),
          items: form.items.filter((it: any) => it.type === "feature"),
          system: form.system.toObject(),
        },
      } as unknown as PolymorphFlag
    }

    if (polymorphFlag && duration === "focus" && caster) {
      const focused = await PolymorphUtil.focusOnNewPolymorph(caster, targets)
      if (!focused) return
    }

    const previousCasterIds = new Set(
      targets.map(
        (t) =>
          (t.getFlag(sys_id, "polymorph") as PolymorphFlag | undefined)
            ?.casterId,
      ),
    )

    for (const target of targets) {
      await target.system.setPolymorph(
        polymorphFlag &&
          PolymorphUtil.withOriginalTokens(polymorphFlag, target),
      )
    }

    if (!polymorphFlag) {
      for (const casterId of previousCasterIds) {
        await PolymorphUtil.dropFocusIfUnmaintained(casterId)
      }
    }

    /**
     * Automatically set NPC's to Focus on this effect.
     */
    if (polymorphFlag && (caster?.type as string) !== "hero") {
      StatusEffectUtil.toggleStatusEffectOnce(caster, "focusing", true)
    }
  }

  static readTokenSize = (token: any): TokenSize => ({
    width: token?.width ?? 1,
    height: token?.height ?? 1,
    depth: token?.depth,
    scaleX: token?.texture?.scaleX ?? 1,
    scaleY: token?.texture?.scaleY ?? 1,
  })

  static tokenSizeUpdate = (size?: TokenSize): Record<string, number> =>
    size
      ? {
          width: size.width,
          height: size.height,
          ...(size.depth !== undefined ? { depth: size.depth } : {}),
          "texture.scaleX": size.scaleX,
          "texture.scaleY": size.scaleY,
        }
      : {}

  /**
   * Shifts the token so a size change grows/shrinks around its current center instead of its top-left corner.
   */
  static centeredPositionUpdate = (
    tokenDoc: any,
    size?: TokenSize,
  ): Record<string, number> => {
    if (!size) return {}
    const gridSize = tokenDoc.parent?.grid?.size ?? 100
    return {
      x: Math.round(
        tokenDoc.x + (((tokenDoc.width ?? 1) - size.width) * gridSize) / 2,
      ),
      y: Math.round(
        tokenDoc.y + (((tokenDoc.height ?? 1) - size.height) * gridSize) / 2,
      ),
    }
  }

  /**
   * Each target gets its own copy of the flag with its tokens' original sizes. Sizes already stored by an
   * earlier polymorph are kept so changing forms still reverts to the real original.
   */
  private static withOriginalTokens = (
    flag: PolymorphFlag,
    target: Actor,
  ): PolymorphFlag => {
    const previous =
      (target.getFlag(sys_id, "polymorph") as PolymorphFlag | undefined)
        ?.originalTokens ?? {}
    const originalTokens: Record<string, TokenSize> = {}
    for (const token of target.getActiveTokens(false, true) as any[]) {
      originalTokens[token.id] =
        previous[token.id] ?? PolymorphUtil.readTokenSize(token)
    }
    return { ...flag, originalTokens }
  }

  /**
   * Focusing on a new polymorph costs one Focus; the caster's earlier polymorphs are no longer focused on.
   */
  private static focusOnNewPolymorph = async (
    caster: Actor & { system: any },
    newTargets: Actor[],
  ): Promise<boolean> => {
    if (
      (caster.type as string) === "hero" &&
      !(await PolymorphUtil.focusPolymorphSpell(caster, newTargets))
    ) {
      return false
    }

    const newIds = new Set(newTargets.map((t) => t.id))
    const sceneActors = game.canvas?.scene?.tokens?.map((t) => t.actor) ?? []
    const demoted = new Set<string | null>()

    for (const actor of sceneActors) {
      if (!actor || newIds.has(actor.id) || demoted.has(actor.id)) continue
      const flag = actor.getFlag(sys_id, "polymorph") as
        | PolymorphFlag
        | undefined
      if (flag?.casterId !== caster.id || flag.duration !== "focus") continue
      demoted.add(actor.id)
      await actor.setFlag(sys_id, "polymorph", { ...flag, duration: "turn" })
    }

    if ((caster.type as string) !== "hero") {
      const focus = caster.system.statuses?.counters?.focus ?? 0
      await caster.update({
        "system.statuses.counters.focus": focus + 1,
      } as Record<string, number>)
    }
    return true
  }

  /**
   * Heroes track the polymorph as a Focused spell: earlier Polymorph Focuses are replaced, and with a single
   * maxFocus any other Focused spell is replaced too. Hostile targets owe a Cast check each round.
   * Returns false when the hero has no Focus capacity left, in which case nothing was changed.
   */
  private static focusPolymorphSpell = async (
    caster: Actor & { system: any },
    targets: Actor[],
  ): Promise<boolean> => {
    const known = (caster.system.spells ?? []).find(
      (sp: any) => sp.parent?.flags?.[sys_id]?.polymorph,
    )
    const spellId: string | undefined = known
      ? (known._sourceId ?? known.parent.uuid)
      : ItemsCache.spells().find((it: any) => it.flags?.[sys_id]?.polymorph)
          ?.uuid
    if (!spellId) return true
    const targetIds = targets.flatMap((t) =>
      (t.getActiveTokens(false, true) as any[]).map((tok) => tok.id as string),
    )
    const isPolymorphSpell = (uuid: string) =>
      uuid === spellId ||
      uuid === known?.parent?.uuid ||
      !!(fromUuidSync(uuid) as any)?.flags?.[sys_id]?.polymorph
    const existing = FocusSpellUtil.instances(caster).filter((it) =>
      isPolymorphSpell(it.spell),
    )

    const adopted = existing[existing.length - 1]
    for (const it of existing) {
      if (it !== adopted) await FocusSpellUtil.drop(caster, it.id, true, true)
    }
    if (adopted) {
      await FocusSpellUtil.update(caster, adopted.id, {
        targetIds,
        polymorph: true,
      })
      return true
    }

    const focus = caster.system.statuses?.counters?.focus ?? 0
    if (focus >= caster.system.maxFocus && caster.system.maxFocus !== 1) {
      ui.notifications?.warn(appLang.Spellcasting.maxFocusMessage)
      return false
    }
    await FocusSpellUtil.add(caster, spellId, foundry.utils.randomID(), {
      targetIds,
      polymorph: true,
    })
    return true
  }

  /**
   * Once nothing the caster polymorphed is still under their Focus, the Polymorph Focus ends too.
   */
  static dropFocusIfUnmaintained = async (casterId?: string | null) => {
    const caster = casterId ? game.actors?.get(casterId) : undefined
    if (!caster || (caster.type as string) !== "hero") return
    const stillMaintained = game.canvas?.scene?.tokens?.some((t) => {
      const flag = t.actor?.getFlag(sys_id, "polymorph") as
        | PolymorphFlag
        | undefined
      return flag?.casterId === casterId && flag?.duration === "focus"
    })
    if (stillMaintained) return
    for (const it of FocusSpellUtil.instances(caster).filter(
      (i) => i.polymorph,
    )) {
      await FocusSpellUtil.drop(caster, it.id, true, true)
    }
  }

  /**
   * Finds all the actors in the scene that have been polymorphed by the given caster and releases them.
   */
  static releaseAllPolymorphs = async (
    caster: Actor & { system: any },
    includeSelf = true,
    checkDuration = true,
  ) => {
    const sceneActors = game.canvas?.scene?.tokens
      ?.map((t) => t.actor)
      ?.filter((it) => ["adversary", "npc", "hero"].includes(it?.type ?? ""))

    const targets: any[] = []

    for (const sceneActor of sceneActors ?? []) {
      const polymorphFlag = sceneActor?.getFlag(
        sys_id,
        "polymorph",
      ) as PolymorphFlag
      if (
        !polymorphFlag ||
        (checkDuration && polymorphFlag.duration !== "focus") ||
        caster.id !== polymorphFlag.casterId ||
        (!includeSelf && caster.id === sceneActor?.id)
      )
        continue
      if (!targets.includes(sceneActor)) targets.push(sceneActor)
    }

    await PolymorphUtil.polymorph({ caster: caster, targets })
  }

  /**
   * Players can't update other actors' polymorphed tokens, so the designated user releases them.
   */
  static releaseAllPolymorphsOnce = (caster: any) => {
    if (
      pendingPolymorphReleases.has(caster.uuid) ||
      !StatusEffectUtil.isDesignatedUser()
    )
      return
    pendingPolymorphReleases.add(caster.uuid)
    Promise.resolve(PolymorphUtil.releaseAllPolymorphs(caster))
      .catch((err) => console.error(err))
      .finally(() => pendingPolymorphReleases.delete(caster.uuid))
  }

  /**
   * Applies the polymorph form's stats on top of the hero's prepared data just like an Active Effect would.
   * This is done (instead of an Active Effect) to make sure all polymorph-related changes are stored in one
   * place and NOT available for the player to partially toggle off by disabling/deleting an Active Effect.
   */
  static applyPolymorphChanges = (
    heroModel: HeroDataModel,
    turnSpeed: number,
  ) => {
    const polymorph = heroModel.polymorph
    if (!polymorph) return
    const form = polymorph.statBlock.system

    if (heroModel.ancestry) {
      heroModel.ancestry.beingType = form.beingType
      heroModel.ancestry.beingSize = form.beingSize
    }
    heroModel.armor.rating += form.armor.rating
    heroModel.speed.turn += form.speeds[0].value - turnSpeed

    const addUnique = (target: string[], values: string[]) => {
      for (const value of values) {
        if (!target.includes(value)) target.push(value)
      }
    }

    addUnique(
      heroModel.modifiers.damage.in.immunities,
      form.modifiers.damage.in.immunities,
    )
    addUnique(
      heroModel.modifiers.damage.in.weaknesses,
      form.modifiers.damage.in.weaknesses,
    )
    addUnique(
      heroModel.modifiers.damage.in.statusImmunities,
      form.modifiers.damage.in.statusImmunities,
    )
    addUnique(heroModel.senses, form.senses)
  }

}

/**
 * Attempts to prevent error messages on player clients when toggling unique effects.
 */
const pendingPolymorphReleases = new Set<string>()
