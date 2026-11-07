import { isMovement } from "../../../apps/focus-manager/focus-hook-rules"
import { FocusSpellUtil } from "../../../model/actor/util/FocusSpellUtil"
import { sys_id } from "../../../util/foundry-util"
import { LightSourceUtil } from "../../../util/LightSourceUtil"
import type { PlacedArea } from "../SpellDelivery"
import { AreaOutline } from "./AreaOutline"
import type { Point } from "./AreaTypes"
import { PlacedAreaCells } from "./PlacedAreaCells"

const ICON_ALPHA = 0.6

/**
 * Draws the areas of Focused spells on every client, for as long as the Focus lasts. The areas live on each
 * Focus instance (an actor flag), so all clients render them from synced data and nothing is stored on the scene.
 */
export class FocusAreaLayer {

  private readonly drawn = new Map<
    string,
    { key: string; node: any; label: string; edges: [Point, Point][] }
  >()
  private lastCombatRound: number | undefined

  registerHooks() {
    Hooks.on("canvasReady", () => {
      this.bindPointer()
      this.sync()
    })
    Hooks.on("canvasTearDown", () => {
      this.unbindPointer()
      this.clear()
    })
    Hooks.on("deleteActor", () => this.sync())
    Hooks.on("updateActor", (_actor: any, changed: any) => {
      if (foundry.utils.hasProperty(changed, `flags.${sys_id}`)) this.sync()
    })
    Hooks.on("updateToken", async (doc: any, changed: any) => {
      if ("disposition" in changed) this.sync()
      if (!this.followsActor(doc.actorId)) return
      if (!("rotation" in changed) && !isMovement(changed)) return
      if (doc.object) await LightSourceUtil.settleAnimations([doc.object])
      this.sync()
    })
    Hooks.on("updateScene", (_scene: any, changed: any) => {
      if (foundry.utils.hasProperty(changed, `flags.${sys_id}`)) this.sync()
    })
    Hooks.on("updateCombat", (combat: any, changed: any) => {
      // Clear temporary spell areas at the start of a new round
      if ("round" in changed && combat.round !== this.lastCombatRound) {
        this.lastCombatRound = combat.round
        const scene = canvas?.scene
        if (scene) {
          // Use socket to have GM update the scene flag (players don't have permission)
          game.socket?.emit(`system.${sys_id}`, {
            action: "updateTemporarySpellAreas",
            sceneId: scene.id,
            areas: {},
          })
        }
      }
    })
  }

  private followsActor(actorId?: string) {
    const actor = actorId ? game.actors?.get(actorId) : undefined
    return FocusSpellUtil.instances(actor).some(
      (it) => it.delivery?.area?.follow?.actorId === actorId,
    )
  }

  clear() {
    for (const { node } of this.drawn.values()) node.destroy({ children: true })
    this.drawn.clear()
  }

  /** Makes the drawn areas match the Focus instances currently on this scene. */
  sync() {
    const cv = canvas as any
    const scene = cv?.scene
    if (!cv?.ready || !scene) return this.clear()

    const wanted = new Map<string, PlacedArea & { label: string }>()
    
    // Add focused spell areas
    for (const actor of game.actors ?? []) {
      for (const instance of FocusSpellUtil.instances(actor)) {
        const stored = instance.delivery?.area
        if (!stored) continue
        const cells = PlacedAreaCells.of(stored)
        if (!cells.length) continue
        const spellName = instance.delivery?.spell.name ?? ""
        const label = `${actor.name} - ${spellName} (${instance.delivery?.name})`
        wanted.set(instance.id, { ...stored, cells, label })
      }
    }
    
    // Add temporary (non-focused) spell areas
    const tempAreas = (scene.getFlag(sys_id, "temporarySpellAreas") as Record<string, any>) || {}
    for (const [attackId, area] of Object.entries(tempAreas)) {
      if (!area || !area.cells) continue
      const cells = PlacedAreaCells.of(area)
      if (!cells.length) continue
      const spellName = area.spell?.name ?? "Unknown Spell"
      const casterName = area.casterName ?? "Unknown Caster"
      const deliveryName = area.delivery?.name ?? "Unknown Delivery"
      const label = `${casterName} - ${spellName} (${deliveryName})`
      wanted.set(`temp-${attackId}`, { ...area, cells, label })
    }

    for (const [id, entry] of this.drawn) {
      const area = wanted.get(id)
      if (area && JSON.stringify(area) === entry.key) continue
      entry.node.destroy({ children: true })
      this.drawn.delete(id)
    }
    for (const [id, area] of wanted) {
      if (this.drawn.has(id)) continue
      this.drawn.set(id, {
        key: JSON.stringify(area),
        node: this.draw(area),
        label: area.label,
        edges: AreaOutline.perimeter(area.cells),
      })
    }
  }

  private draw(area: PlacedArea & { label: string }) {
    const cv = canvas as any
    const grid = cv.grid
    const container = new PIXI.Container()
    const color = Color.from(area.color) as any
    const outline = AreaOutline.create(area.cells, color, 0.8)
    container.addChild(outline)

    if (area.icon) {
      for (const cell of area.cells) {
        const topLeft = grid.getTopLeftPoint(cell)
        const sprite = PIXI.Sprite.from(area.icon)
        sprite.position.set(topLeft.x, topLeft.y)
        sprite.width = grid.sizeX ?? grid.size
        sprite.height = grid.sizeY ?? grid.size
        sprite.alpha = ICON_ALPHA
        container.addChild(sprite)
      }
    }
    cv.interface.grid.addChild(container)
    return container
  }

  /** Shows "Caster — Spell" for every Focused area whose border is under the cursor, as a tooltip. */
  private bindPointer() {
    this.unbindPointer()
    const view = (canvas as any)?.app?.view as HTMLElement | undefined
    if (!view) return
    const anchor = document.createElement("div")
    anchor.style.cssText =
      "position:fixed;width:1px;height:1px;pointer-events:none;opacity:0"
    document.body.appendChild(anchor)
    let shown = ""
    const hide = () => {
      if (!shown) return
      shown = ""
      game.tooltip?.deactivate()
    }
    const onMove = (event: PointerEvent) => {
      const labels = this.labelsAt(
        (canvas as any).canvasCoordinatesFromClient({
          x: event.clientX,
          y: event.clientY,
        }),
      )
      const key = labels.join("\n")
      if (!key) return hide()
      anchor.style.left = `${event.clientX}px`
      anchor.style.top = `${event.clientY}px`
      if (key === shown) return
      shown = key
      const html = document.createElement("div")
      labels.forEach((text) => {
        const line = document.createElement("div")
        line.textContent = text
        html.appendChild(line)
      })
      game.tooltip?.activate(anchor, { html, direction: "UP" as any })
    }
    view.addEventListener("pointermove", onMove)
    view.addEventListener("pointerleave", hide)
    this.unbind = () => {
      view.removeEventListener("pointermove", onMove)
      view.removeEventListener("pointerleave", hide)
      hide()
      anchor.remove()
    }
  }

  private unbind?: () => void

  private unbindPointer() {
    this.unbind?.()
    this.unbind = undefined
  }

  /** Caster and spell name of each drawn area whose border is within a few pixels of the world point. */
  private labelsAt(point: Point): string[] {
    const reach = Math.max(6, (canvas as any).grid.size * 0.1)
    return [...this.drawn.values()]
      .filter(({ edges }) =>
        edges.some(
          ([a, b]) => AreaOutline.distanceToSegment(point, a, b) <= reach,
        ),
      )
      .map(({ label }) => label)
  }

}
