import type { PlacedArea } from "../SpellDelivery"
import { AreaRenderer } from "./AreaRenderer"
import type { Point } from "./AreaTypes"

/** The grid squares a persisted Focus area covers right now. */
export class PlacedAreaCells {

  /**
   * Squares of an area on the current scene. Auras and Cones follow their caster's token, so they are recomputed;
   * an area on another scene (or whose caster has no token here) covers nothing.
   */
  static of(area: PlacedArea | undefined): Point[] {
    const scene = (canvas as any)?.scene
    if (!area || !scene || area.sceneId !== scene.id) return []
    const { follow } = area
    if (!follow) return area.cells ?? []
    const actor = game.actors?.get(follow.actorId)
    return AreaRenderer.cellsAroundToken(actor, follow.kind, follow.size)
  }

}
