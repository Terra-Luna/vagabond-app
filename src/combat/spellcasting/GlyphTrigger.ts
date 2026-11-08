import { AreaColor } from "./aoe/AreaColor"
import type { PlacedGlyphData } from "./aoe/PlacedGlyph"
import { AreaOccupants } from "./aoe/targeting/AreaOccupants"
import { Cube, type PlacedArea, type SpellSnapshot } from "./SpellDelivery"

export interface GlyphTriggerChoices {
  /** Damage dice to roll (0 for effect-only, or a spell with no damage). */
  dice: number
  /** Cast the spell "for effect". */
  effect: boolean
  focused: boolean
}

/**
 * Triggering a Glyph casts its spell as a Cube on the Glyph's square. The Glyph's own cost already paid for the
 * Cube's base cost, so only what the caster adds (extra damage dice, the effect) costs mana.
 */
export class GlyphTrigger {

  /** The tokens standing on the Glyph's square, which the Cube hits. */
  static occupantIds(glyph: PlacedGlyphData): string[] {
    return AreaOccupants.tokensIn([glyph.cell]).map(
      (token) => token.document.id as string,
    )
  }

  /** What the Glyph's placement already paid toward a Cube cast with this many damage dice. */
  private static prepaid(spell: SpellSnapshot, dice: number): number {
    const damage = dice > 0 && spell.damageType !== "none"
    return new Cube(spell, { damageUpcastDiscount: 0, deliveryUpcastDiscount: 0 })
      .baseManaCost + (damage ? (spell.baseManaCost ?? 0) : 0)
  }

  /** The Cube the Glyph casts for the given choices, with its prepaid base cost taken off. */
  static deliveryFor(
    glyph: PlacedGlyphData,
    mods: Cube["mods"],
    choices: GlyphTriggerChoices,
  ): Cube {
    const spell: SpellSnapshot = {
      ...glyph.spell,
      manaDiscount:
        (glyph.spell.manaDiscount ?? 0) +
        GlyphTrigger.prepaid(glyph.spell, choices.dice),
    }
    const cube = new Cube(spell, mods)
    cube.setSpell(spell)
    cube.setDamageDice(choices.dice)
    cube.setApplyEffect(choices.effect)
    cube.setIsFocused(choices.focused)
    return cube
  }

  /** The Cube's area on the canvas, so it can be drawn (and kept by a Focus). */
  static areaOf(glyph: PlacedGlyphData): PlacedArea {
    return {
      sceneId: glyph.sceneId,
      cells: [glyph.cell],
      color: AreaColor.of(glyph.spell.damageType),
    }
  }

}
