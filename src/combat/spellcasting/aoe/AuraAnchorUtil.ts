import type { PlacedArea } from "../SpellDelivery"

/** An Aura is normally centered on its caster, but a Familiar can be its center instead (the area's `follow.tokenId`). */
export class AuraAnchorUtil {

  /** A missing token counts as down, as does one whose actor is dead or at 0 HP. */
  static isDown(token: any): boolean {
    const actor = token?.actor
    if (!actor) return true
    return actor.system?.health?.value <= 0 || !!actor.statuses?.has("dead")
  }

  /** The token the area is centered on, when that is not its caster. */
  static tokenOf(area: PlacedArea | undefined): any | undefined {
    const tokenId = area?.follow?.tokenId
    if (!tokenId) return undefined
    return game.scenes?.get(area!.sceneId)?.tokens.get(tokenId)
  }

  /** The area is centered on a token that has since died or been removed. */
  static isLost(area: PlacedArea | undefined): boolean {
    return (
      !!area?.follow?.tokenId && AuraAnchorUtil.isDown(AuraAnchorUtil.tokenOf(area))
    )
  }

}
