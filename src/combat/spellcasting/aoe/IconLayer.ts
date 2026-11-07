import type { Point } from "./AreaTypes"

/** Draws one image filling each of a set of grid squares. */
export class IconLayer {

  static readonly GLYPH =
    "icons/magic/symbols/runes-triangle-orange-purple.webp"

  private container?: any

  constructor(private readonly alpha = 0.6) {}

  /** Draws `icon` in each grid square containing one of `points`, replacing any icons drawn before. */
  show(points: Point[], icon: string) {
    this.clear()
    const cv = canvas as any
    if (!cv?.ready || !points.length) return
    const grid = cv.grid
    const container = new PIXI.Container()
    for (const p of points) {
      const topLeft = grid.getTopLeftPoint(grid.getOffset(p))
      const sprite = PIXI.Sprite.from(icon)
      sprite.position.set(topLeft.x, topLeft.y)
      sprite.width = grid.sizeX ?? grid.size
      sprite.height = grid.sizeY ?? grid.size
      sprite.alpha = this.alpha
      container.addChild(sprite)
    }
    cv.interface.grid.addChild(container)
    this.container = container
  }

  clear() {
    this.container?.destroy({ children: true })
    this.container = undefined
  }

}
