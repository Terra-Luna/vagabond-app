import { VagabondActiveEffect } from "../../../combat/documents/VagabondActiveEffect"
import { AdversaryDataModel } from "../AdversaryDataModel"
import { HeroDataModel } from "../HeroDataModel"
import { NpcDataModel } from "../NpcDataModel"

export class StatusEffectUtil {

    static isDesignatedUser = () => {
        return (game.users?.activeGM ?? game.user)?.id === game.user?.id
    }

    static toggleStatusEffectOnce = (actor: any, statusId: string, active: boolean) => {
        const effectId = VagabondActiveEffect.statusEffects.find(it => it.id === statusId)?._id
        if (!effectId) return

        const key = `${actor.uuid}:${statusId}:${active}`
        if (pendingStatusToggles.has(key)) return

        const hasEffect = actor.effects.has(effectId)
        if (hasEffect === active) return

        if (!StatusEffectUtil.isDesignatedUser()) return

        pendingStatusToggles.add(key)
        Promise.resolve(actor.toggleStatusEffect(statusId, { active }))
            .catch(err => console.error(err))
            .finally(() => pendingStatusToggles.delete(key))
    }

    static validateCurrentFocus = (actorModel: AdversaryDataModel | NpcDataModel | HeroDataModel) => {
        if (!actorModel.statuses.toggles.focusing && actorModel.statuses.counters.focus > 0) {
            StatusEffectUtil.toggleStatusEffectOnce(actorModel.parent, "focusing", true)
        }
        else if (actorModel.statuses.toggles.focusing && actorModel.statuses.counters.focus === 0) {
            StatusEffectUtil.toggleStatusEffectOnce(actorModel.parent, "focusing", false)
        }
        if (actorModel.parent.type === "hero" && ((actorModel as any).statuses.counters.focus! > (actorModel as any).maxFocus)) {
            actorModel.statuses.counters.focus = (actorModel as any).maxFocus
        }
    }
}

/**
 * Attempts to prevent error messages on player clients when toggling unique effects.
 */
const pendingStatusToggles = new Set<string>()