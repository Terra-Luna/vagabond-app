import { StatusEffectUtil } from "../../../model/actor/util/StatusEffectUtil"
import { LightSourceUtil } from "../../../util/LightSourceUtil"
import { VagabondActiveEffect } from "../../documents/VagabondActiveEffect"
import { isActiveEffectFx, isLightFx, parseLightFx, removeActiveEffectCopy } from "./active-effect-fx"

/** Whether the actor currently has the status, as a token status or an effect. */
const hasStatus = (actor: any, status: string): boolean => {
  const effectId = VagabondActiveEffect.statusEffects.find(
    (it) => it.id === status,
  )?._id
  return (
    !!actor?.statuses?.has(status) ||
    (!!effectId && !!actor?.effects?.has(effectId))
  )
}

/** Removes one applied effect from an actor, whether it is a granted light, an Active Effect copy or a plain status. */
export const removeFx = async (actor: any, effect: string) => {
  if (isLightFx(effect))
    await LightSourceUtil.clearGrantedLight(actor, parseLightFx(effect).type)
  else if (isActiveEffectFx(effect)) await removeActiveEffectCopy(actor, effect)
  else if (hasStatus(actor, effect))
    await StatusEffectUtil.toggleStatusEffectOnce(actor, effect, false)
}
