import { AreaOfEffectDelivery, Aura, type AuraCenter, Line, PerTargetDelivery, type SpellDelivery } from "./SpellDelivery"

/** How the Spellcasting menu was last set for a spell. */
export interface SpellcastingMenuState {
  skill: string
  spellUuid: string
  deliveryName: string
  damageDice: number
  studyDamageDice: number
  applyEffect: boolean
  isFocused: boolean
  discount: number
  size?: number
  height?: number
  width?: number
  targetCount?: number
  auraCenter?: AuraCenter
}

/** The key a spell's menu settings are stored under (a uuid has dots, which flag paths can't hold). */
export const spellStateKey = (spellUuid: string) =>
  spellUuid.replace(/\./g, "_")

/** Puts a delivery back to the settings it was last used with. */
export const restoreMenuState = (
  delivery: SpellDelivery,
  saved: SpellcastingMenuState,
) => {
  delivery.setDamageDice(saved.damageDice)
  delivery.setStudyDamageDice(saved.studyDamageDice)
  delivery.setApplyEffect(saved.applyEffect)
  delivery.setIsFocused(saved.isFocused)
  delivery.setDiscount(saved.discount)
  if (delivery instanceof AreaOfEffectDelivery && saved.size !== undefined)
    delivery.setSize(saved.size)
  if (delivery instanceof Aura && saved.auraCenter)
    delivery.setCenter(saved.auraCenter)
  if (
    delivery instanceof Line &&
    saved.height !== undefined &&
    saved.width !== undefined
  ) {
    delivery.setHeight(saved.height)
    delivery.setWidth(saved.width)
  }
  if (delivery instanceof PerTargetDelivery && saved.targetCount !== undefined)
    delivery.setTargetCount(saved.targetCount)
}
