import { sys_id } from "../../../utils/foundryUtils"
import type { AdversaryDataModel } from "../AdversaryDataModel"
import type { HeroDataModel } from "../HeroDataModel"
import type { NpcDataModel } from "../NpcDataModel"
import { StatusEffectUtil } from "./StatusEffectUtil"

export interface PolymorphFlag {
    casterId: string,
    duration: 'focus' | 'continual' | 'turn',
    statBlock: PolymorphStatBlock,
    equipHistory?: (string | null)[]
}

interface PolymorphStatBlock {
    id: string,
    name: string,
    tokenImg: string,
    items: any[],
    system: NpcDataModel
}

export class PolymorphUtil {

    /**
     * The main function to call first when trying to polymorph something.
     * Requires either a caster and a form or just a target to release from polymorph.
     */
    static polymorph = async ({ caster, targets, form, duration }: {
        caster?: Actor & { system: HeroDataModel | NpcDataModel | AdversaryDataModel },
        targets: (Actor & { system: HeroDataModel | NpcDataModel | AdversaryDataModel })[],
        form?: Actor & { system: NpcDataModel | AdversaryDataModel },
        duration?: 'focus' | 'continual' | 'turn'
    }) => {
        targets = (targets ?? []).filter(Boolean)
        if ((form && !caster) || targets.length === 0) return

        const canUpdateTargets = targets.every(target =>
            target.isOwner && (target.getActiveTokens(false, true) as any[]).every(t => t.isOwner))

        if (!canUpdateTargets && !game.user?.isActiveGM) {
            if (!game.users?.activeGM) {
                ui.notifications?.warn("A GM must be connected to polymorph or revert targets you don't own.")
                return
            }
            /**
             * This socket is dedicated for allowing players to release their polymorph targets w/o GM intervention.
             */
            game.socket?.emit(`system.${sys_id}`, {
                action: "polymorph",
                data: { casterUuid: caster?.uuid, targetUuids: targets.map(t => t.uuid), formUuid: form?.uuid, duration }
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
                    tokenImg: form.prototypeToken?.texture?.src || form.prototypeToken?.ring?.subject?.texture || form.img,
                    items: form.items.filter((it: any) => it.type === "feature"),
                    system: form.system.toObject()
                }
            } as unknown as PolymorphFlag
        }

        if (polymorphFlag && duration === 'focus' && caster) {
            await PolymorphUtil.focusOnNewPolymorph(caster, targets)
        }

        for (const target of targets) {
            await target.system.setPolymorph(polymorphFlag)
        }

        /**
         * Automatically set NPC's to Focus on this effect.
         */
        if (polymorphFlag && (caster?.type as string) !== "hero") {
            StatusEffectUtil.toggleStatusEffectOnce(caster, "focusing", true)
        }
    }

    /**
     * Focusing on a new polymorph costs one Focus; the caster's earlier polymorphs are no longer focused on.
     */
    private static focusOnNewPolymorph = async (caster: Actor & { system: any }, newTargets: Actor[]) => {
        const newIds = new Set(newTargets.map(t => t.id))
        const sceneActors = game.canvas?.scene?.tokens?.map(t => t.actor) ?? []
        const demoted = new Set<string | null>()

        for (const actor of sceneActors) {
            if (!actor || newIds.has(actor.id) || demoted.has(actor.id)) continue
            const flag = actor.getFlag(sys_id, "polymorph") as PolymorphFlag | undefined
            if (flag?.casterId !== caster.id || flag.duration !== "focus") continue
            demoted.add(actor.id)
            await actor.setFlag(sys_id, "polymorph", { ...flag, duration: "turn" })
        }

        const focus = caster.system.statuses?.counters?.focus ?? 0
        await caster.update({ "system.statuses.counters.focus": focus + 1 } as Record<string, number>)
    }

    /**
     * Finds all the actors in the scene that have been polymorphed by the given caster and releases them.
     */
    static releaseAllPolymorphs = async (caster: Actor & { system: any }, includeSelf = true, checkDuration = true) => {
        const sceneActors = game.canvas?.scene?.tokens
            ?.map(t => t.actor)
            ?.filter(it => ["adversary", "npc", "hero"].includes(it?.type ?? ""))

        const targets: any[] = []

        for (const sceneActor of sceneActors ?? []) {
            const polymorphFlag = sceneActor?.getFlag(sys_id, "polymorph") as PolymorphFlag
            if (!polymorphFlag || (checkDuration && polymorphFlag.duration !== "focus") || caster.id !== polymorphFlag.casterId || (!includeSelf && caster.id === sceneActor?.id)) continue
            if (!targets.includes(sceneActor)) targets.push(sceneActor)
        }

        await PolymorphUtil.polymorph({ caster: caster, targets })
    }
    
    /**
     * Players can't update other actors' polymorphed tokens, so the designated user releases them.
     */
    static releaseAllPolymorphsOnce = (caster: any) => {
        if (pendingPolymorphReleases.has(caster.uuid) || !StatusEffectUtil.isDesignatedUser()) return
        pendingPolymorphReleases.add(caster.uuid)
        Promise.resolve(PolymorphUtil.releaseAllPolymorphs(caster))
            .catch(err => console.error(err))
            .finally(() => pendingPolymorphReleases.delete(caster.uuid))
    }

    /**
     * Applies the polymorph form's stats on top of the hero's prepared data just like an Active Effect would.
     * This is done (instead of an Active Effect) to make sure all polymorph-related changes are stored in one
     * place and NOT available for the player to partially toggle off by disabling/deleting an Active Effect.
     */
    static applyPolymorphChanges = (heroModel: HeroDataModel, turnSpeed: number) => {
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

        addUnique(heroModel.modifiers.damage.in.immunities, form.modifiers.damage.in.immunities)
        addUnique(heroModel.modifiers.damage.in.weaknesses, form.modifiers.damage.in.weaknesses)
        addUnique(heroModel.modifiers.damage.in.statusImmunities, form.modifiers.damage.in.statusImmunities)
        addUnique(heroModel.senses, form.senses)
    }

}

/**
 * Attempts to prevent error messages on player clients when toggling unique effects.
 */
const pendingPolymorphReleases = new Set<string>()