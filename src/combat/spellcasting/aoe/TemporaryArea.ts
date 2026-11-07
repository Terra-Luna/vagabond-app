import { sys_id } from "../../../util/foundry-util"
import type { PlacedArea } from "../SpellDelivery"
import { PlacedAreaCells } from "./PlacedAreaCells"

/** An area of a freshly cast spell, with what the canvas needs to label it. */
export type TemporaryAreaType = PlacedArea & {
  casterName: string
  spellName: string
  deliveryName: string
}

/**
 * Areas of spells that have just been cast, shown until a Focus takes over drawing them or, for spells that are not
 * Focused, until the next round of combat begins. They live in a scene flag (so every client draws them).
 * Players cannot write scene flags, so their casts are relayed to the active GM.
 */
export class TemporaryArea {

  private static readonly FLAG = "temporarySpellAreas"
  private static readonly SOCKET_ACTION = "addTemporarySpellArea"
  private static readonly REMOVE_ACTION = "removeTemporarySpellArea"

  /** The areas currently marked on the scene, keyed by the attack that cast them. */
  static of(scene: any): Record<string, TemporaryAreaType> {
    return (
      (scene?.getFlag(sys_id, TemporaryArea.FLAG) as
        | Record<string, TemporaryAreaType>
        | undefined) ?? {}
    )
  }

  /** Marks the area of a cast. Auras and Cones are frozen where they were cast. */
  static async add(
    attackId: string,
    area: PlacedArea,
    labels: Omit<TemporaryAreaType, keyof PlacedArea>,
  ) {
    const fixed: TemporaryAreaType = {
      ...area,
      ...labels,
      cells: PlacedAreaCells.of(area).map((p) => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
      })),
    }
    delete fixed.follow
    if (!fixed.cells.length) return
    if (game.user?.isActiveGM)
      return TemporaryArea.store(area.sceneId, attackId, fixed)
    game.socket?.emit(`system.${sys_id}`, {
      action: TemporaryArea.SOCKET_ACTION,
      sceneId: area.sceneId,
      attackId,
      area: fixed,
    })
  }

  /** Handles a relayed add or remove; only the active GM writes. Returns whether the packet was one of ours. */
  static async receive(packet: any): Promise<boolean> {
    if (packet?.action === TemporaryArea.REMOVE_ACTION) {
      if (game.user?.isActiveGM && packet.sceneId && packet.attackId)
        await TemporaryArea.remove(packet.sceneId, packet.attackId)
      return true
    }
    if (packet?.action !== TemporaryArea.SOCKET_ACTION) return false
    if (
      game.user?.isActiveGM &&
      packet.sceneId &&
      packet.attackId &&
      packet.area
    )
      await TemporaryArea.store(packet.sceneId, packet.attackId, packet.area)
    return true
  }

  /** Drops one cast's area, e.g. once a Focus takes over drawing it. Players relay the request to the active GM. */
  static async remove(sceneId: string, attackId: string) {
    if (!game.user?.isActiveGM) {
      game.socket?.emit(`system.${sys_id}`, {
        action: TemporaryArea.REMOVE_ACTION,
        sceneId,
        attackId,
      })
      return
    }
    const scene = game.scenes?.get(sceneId)
    if (scene && attackId in TemporaryArea.of(scene))
      await scene.unsetFlag(sys_id, `${TemporaryArea.FLAG}.${attackId}`)
  }

  /**
   * Removes the temporary areas from every scene that has some. A combat is not necessarily tied to a scene,
   * so it cannot say which scene the areas were cast on. Only the active GM may do so.
   */
  static async clearAll() {
    if (!game.user?.isActiveGM) return
    for (const scene of game.scenes ?? []) {
      if (Object.keys(TemporaryArea.of(scene)).length)
        await scene.unsetFlag(sys_id, TemporaryArea.FLAG)
    }
  }

  private static async store(
    sceneId: string,
    attackId: string,
    area: TemporaryAreaType,
  ) {
    const scene = game.scenes?.get(sceneId)
    if (!scene) return
    // A keyed update, so simultaneous casts never overwrite each other.
    await scene.update({
      [`flags.${sys_id}.${TemporaryArea.FLAG}.${attackId}`]: area,
    })
  }

}
