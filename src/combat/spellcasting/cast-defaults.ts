import { Imbue, type SpellDelivery } from "./SpellDelivery"

/**
 * What a spell starts out as in the Spellcasting menu: no damage dice, cast for its effect, and Focused. An Imbue
 * rides on another attack, so it keeps the plain defaults. A delivery's own rules still apply on top (a Glyph never
 * starts Focused, a fixed-cost spell can't do both, and so on).
 */
export const applyCastDefaults = (delivery: SpellDelivery) => {
  if (delivery instanceof Imbue) return
  delivery.setDamageDice(0)
  delivery.setApplyEffect(true)
  delivery.setIsFocused(true)
}
