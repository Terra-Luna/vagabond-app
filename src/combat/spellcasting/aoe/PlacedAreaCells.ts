import type { PlacedArea } from "../SpellDelivery"
import { AreaRenderer } from "./AreaRenderer"
import type { Point } from "./AreaTypes"
import { AuraAnchorUtil } from "./AuraAnchorUtil"

/** The grid squares a persisted Focus area covers right now. */
export class PlacedAreaCells {

  /**
   * Squares of an area on the current scene. Auras and Cones follow their caster's token (or the Familiar an Aura is
   * centered on), so they are recomputed; an area on another scene, whose center has no token here, or whose
   * Familiar has died, covers nothing.
   */
  static of(area: PlacedArea | undefined): Point[] {
    const scene = (canvas as any)?.scene
    if (!area || !scene || area.sceneId !== scene.id) return []
    const { follow } = area
    if (!follow) return area.cells ?? []
    const actor = game.actors?.get(follow.actorId)
    if (!follow.tokenId)
      return AreaRenderer.cellsAroundToken(actor, follow.kind, follow.size)
    const token = AuraAnchorUtil.tokenOf(area)
    if (AuraAnchorUtil.isDown(token) || !token.object) return []
    return AreaRenderer.cellsAroundToken(
      actor,
      follow.kind,
      follow.size,
      token.object,
    )
  }

}
