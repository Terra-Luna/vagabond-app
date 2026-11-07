import { AreaColor } from "./AreaColor"
import type { Cell, Point, Rect, TokenEmittedArea } from "./AreaTypes"
import { HighlightLayer } from "./HighlightLayer"
import { IconLayer } from "./IconLayer"
import type { AreaShape } from "./shape/AreaShape"
import { AuraShape } from "./shape/AuraShape"
import { ConeShape } from "./shape/ConeShape"
import { LineShape } from "./shape/LineShape"
import { SphereShape } from "./shape/SphereShape"
import { TokenHeading } from "./TokenHeading"
import { WallClip } from "./WallClip"

/** Draws spell areas on the grid: a transient preview layer, a pinned layer and an icon layer, all tinted one color. */
export class AreaRenderer {

  private readonly preview = new HighlightLayer("vagabond-area-preview", 0.15)
  private readonly pinned = new HighlightLayer("vagabond-area-pinned", 0.2)
  private readonly icons = new IconLayer()
  private color = AreaColor.DEFAULT

  /** Tints areas with the color for a damage type, or the default when there is none. */
  setDamageType(damageType?: string) {
    this.color = AreaColor.of(damageType)
  }

  /** Removes the preview layer. */
  clear() {
    this.preview.clear()
  }

  /** Removes everything that was pinned, icons included. */
  clearPinned() {
    this.icons.clear()
    this.pinned.clear()
  }

  /** Highlights every grid square within `radiusFeet` of the Hero's token. */
  showAura(actor: any, radiusFeet: number) {
    return this.showAroundToken(actor, "aura", radiusFeet)
  }

  /** Highlights the squares of a cone `lengthFeet` long, from the token's center toward where it faces. */
  showCone(actor: any, lengthFeet: number) {
    return this.showAroundToken(actor, "cone", lengthFeet)
  }

  /** The square centers an Aura or Cone currently covers around the Hero's token, without drawing anything. */
  static cellsAroundToken(
    actor: any,
    kind: TokenEmittedArea,
    feet: number,
  ): Point[] {
    const placement = AreaRenderer.placeAtToken(actor, kind, feet)
    if (!placement || !(feet > 0)) return []
    const { grid, rect, shape } = placement
    return WallClip.reachable(
      AreaRenderer.centerOf(rect),
      shape.select(
        AreaRenderer.cellsNear(grid, rect, feet, kind === "aura").map(
          (c) => c.center,
        ),
      ),
    )
  }

  private static centerOf(rect: Rect): Point {
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  }

  private static placeAtToken(
    actor: any,
    kind: TokenEmittedArea,
    feet: number,
  ) {
    const grid = AreaRenderer.grid()
    const token = AreaRenderer.tokenFor(actor)
    if (!grid || !token) return undefined
    const rect: Rect = {
      x: token.document.x,
      y: token.document.y,
      width: token.document.width * grid.size,
      height: token.document.height * grid.size,
    }
    const shape: AreaShape =
      kind === "aura"
        ? new AuraShape(
            rect,
            feet,
            AreaRenderer.pixelsPerUnit(grid),
            !grid.isHexagonal,
          )
        : new ConeShape(
            { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
            TokenHeading.of(token.document.id) ?? token.document.rotation ?? 0,
            feet * AreaRenderer.pixelsPerUnit(grid),
          )
    return { grid, rect, shape }
  }

  /** Highlights a sphere of `radiusFeet` centered on a point, snapped to the nearest grid corner. */
  showSphere(point: Point, radiusFeet: number, pinned = false) {
    const grid = AreaRenderer.grid()
    if (!grid) return []
    const center = AreaRenderer.snap(grid, point, "VERTEX")
    return this.paint(
      pinned ? this.pinned : this.preview,
      { x: center.x, y: center.y, width: 0, height: 0 },
      radiusFeet,
      new SphereShape(center, radiusFeet, AreaRenderer.pixelsPerUnit(grid)),
    )
  }

  /** Highlights a line starting at the grid square under `point` and running `angle` degrees (0 = east, clockwise). */
  showLine(
    point: Point,
    angle: number,
    lengthFeet: number,
    widthFeet: number,
    pinned = false,
  ) {
    const grid = AreaRenderer.grid()
    if (!grid) return []
    const start = AreaRenderer.snap(grid, point, "CENTER")
    return this.paint(
      pinned ? this.pinned : this.preview,
      { x: start.x, y: start.y, width: 0, height: 0 },
      lengthFeet,
      new LineShape(
        start,
        angle,
        lengthFeet,
        widthFeet,
        AreaRenderer.pixelsPerUnit(grid),
      ),
    )
  }

  /** Highlights whole grid squares: `placed` on the pinned layer and, when given, the square under `hover` on the preview layer. */
  showCubes(placed: Point[], hover?: Point): Point[] {
    const grid = AreaRenderer.grid()
    if (!grid) return []
    const topLeft = (p: Point) =>
      grid.getTopLeftPoint(grid.getOffset(p)) as Point
    this.pinned.fill(placed.map(topLeft), this.color)
    this.preview.fill(hover ? [topLeft(hover)] : [], this.color)
    return placed.map((p) => grid.getCenterPoint(grid.getOffset(p)))
  }

  /** Draws `icon` filling each grid square containing one of `points`. */
  showIcons(points: Point[], icon: string) {
    this.icons.show(points, icon)
  }

  private showAroundToken(
    actor: any,
    kind: TokenEmittedArea,
    reachFeet: number,
  ): Point[] {
    this.clear()
    const placement = AreaRenderer.placeAtToken(actor, kind, reachFeet)
    if (!placement) return []
    return this.paint(
      this.preview,
      placement.rect,
      reachFeet,
      placement.shape,
      kind === "aura",
    )
  }

  /** Fills the layer with the squares near `rect` that the shape covers. Squares whose center is inside `rect` (the caster's own) are skipped unless `includeOwn`. */
  private paint(
    layer: HighlightLayer,
    rect: Rect,
    reachFeet: number,
    shape: AreaShape,
    includeOwn = false,
  ): Point[] {
    const grid = AreaRenderer.grid()
    layer.clear()
    if (!grid || !(reachFeet > 0)) return []
    const cells = AreaRenderer.cellsNear(grid, rect, reachFeet, includeOwn)
    const within = WallClip.reachable(
      AreaRenderer.centerOf(rect),
      shape.select(cells.map((c) => c.center)),
    )
    const withinSet = new Set(within)
    layer.fill(
      cells.filter((c) => withinSet.has(c.center)).map((c) => c.topLeft),
      this.color,
    )
    return within
  }

  private static cellsNear(
    grid: any,
    rect: Rect,
    reachFeet: number,
    includeOwn = false,
  ) {
    const reach = Math.ceil(reachFeet / grid.distance) + 1
    const first = grid.getOffset({ x: rect.x, y: rect.y })
    const last = grid.getOffset({
      x: rect.x + rect.width - 1,
      y: rect.y + rect.height - 1,
    })
    const cells: Cell[] = []
    for (let i = first.i - reach; i <= last.i + reach; i++) {
      for (let j = first.j - reach; j <= last.j + reach; j++) {
        const center = grid.getCenterPoint({ i, j })
        const inside =
          center.x > rect.x &&
          center.x < rect.x + rect.width &&
          center.y > rect.y &&
          center.y < rect.y + rect.height
        if (includeOwn || !inside)
          cells.push({ center, topLeft: grid.getTopLeftPoint({ i, j }) })
      }
    }
    return cells
  }

  private static grid(): any | undefined {
    const cv = canvas as any
    return cv?.ready ? cv.grid : undefined
  }

  private static pixelsPerUnit(grid: any) {
    return grid.size / grid.distance
  }

  private static snap(grid: any, point: Point, mode: "VERTEX" | "CENTER") {
    return grid.getSnappedPoint(point, {
      mode: (CONST as any).GRID_SNAPPING_MODES[mode],
    }) as Point
  }

  /** The Hero's token on the current scene, preferring a controlled one. */
  private static tokenFor(actor: any): any | undefined {
    const tokens = (actor?.getActiveTokens?.() ?? []) as any[]
    return tokens.find((t) => t.controlled) ?? tokens[0]
  }

}
