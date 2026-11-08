import { sys_id } from "../../../util/foundry-util"
import type { SpellSnapshot } from "../SpellDelivery"
import type { Point } from "./AreaTypes"

/** A Glyph a caster has placed on a scene, waiting to be triggered. It stays where it is, with no Focus needed. */
export interface PlacedGlyphData {
  id: string
  sceneId: string
  /** Center of the square the Glyph occupies. */
  cell: Point
  spell: SpellSnapshot
  /** The skill the Glyph's Cast check is made with. */
  skill: string
}

const SELECT_HOOK = "vagabondGlyphSelect"

/**
 * Glyphs live in an actor flag, so every client draws them from synced data and they outlast any Focus. Selecting
 * one (in the Focus app) highlights it on the canvas.
 */
export class PlacedGlyph {

  static readonly FLAG = "placedGlyphs"

  private static selectedId: string | undefined

  static of(actor: any): PlacedGlyphData[] {
    return (actor?.getFlag?.(sys_id, PlacedGlyph.FLAG) as PlacedGlyphData[]) ?? []
  }

  /** The Glyphs of an actor that sit on the scene being viewed. */
  static onScene(actor: any): PlacedGlyphData[] {
    const sceneId = (canvas as any)?.scene?.id
    return PlacedGlyph.of(actor).filter((glyph) => glyph.sceneId === sceneId)
  }

  static async add(actor: any, glyph: Omit<PlacedGlyphData, "id">) {
    await actor.setFlag(sys_id, PlacedGlyph.FLAG, [
      ...PlacedGlyph.of(actor),
      { ...glyph, id: foundry.utils.randomID() },
    ])
  }

  static async remove(actor: any, id: string) {
    const rest = PlacedGlyph.of(actor).filter((glyph) => glyph.id !== id)
    if (rest.length === PlacedGlyph.of(actor).length) return
    if (rest.length) await actor.setFlag(sys_id, PlacedGlyph.FLAG, rest)
    else await actor.unsetFlag(sys_id, PlacedGlyph.FLAG)
    if (PlacedGlyph.selectedId === id) PlacedGlyph.select(undefined)
  }

  static get selected(): string | undefined {
    return PlacedGlyph.selectedId
  }

  /** Highlights one Glyph on the canvas, or none. Everyone's drawn Glyphs are redrawn through a hook. */
  static select(id: string | undefined) {
    if (PlacedGlyph.selectedId === id) return
    PlacedGlyph.selectedId = id
    ;(Hooks as any).callAll(SELECT_HOOK, id)
  }

  static onSelect(listener: (id: string | undefined) => void) {
    const hookId = Hooks.on(SELECT_HOOK as any, listener as any)
    return () => Hooks.off(SELECT_HOOK as any, hookId)
  }

  /** Slides the camera over to the Glyph. */
  static async panTo(glyph: PlacedGlyphData) {
    if ((canvas as any)?.scene?.id !== glyph.sceneId) return
    await canvas?.animatePan({ x: glyph.cell.x, y: glyph.cell.y, duration: 500 })
  }

}
