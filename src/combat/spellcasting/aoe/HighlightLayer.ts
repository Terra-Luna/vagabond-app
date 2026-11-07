import { AreaOutline } from "./AreaOutline"
import type { Point } from "./AreaTypes"

/** A named grid highlight layer that draws squares at a fixed opacity. */
export class HighlightLayer {

  constructor(
    private readonly name: string,
    private readonly alpha: number,
  ) {}

  private static readonly nodes = new Map<string, any>()

  clear() {
    const node = HighlightLayer.nodes.get(this.name)
    if (!node) return
    node.destroy({ children: true })
    HighlightLayer.nodes.delete(this.name)
  }

  /** Replaces the layer's contents with outlines of the squares at the given top-left corners. */
  fill(topLefts: Point[], color: string) {
    this.clear()
    const cv = canvas as any
    if (!topLefts.length || !cv?.ready) return
    const grid = cv.grid
    // Offsetting to the middle keeps each point unambiguously inside its own square.
    const halfX = (grid.sizeX ?? grid.size) / 2
    const halfY = (grid.sizeY ?? grid.size) / 2
    const inside = topLefts.map((p) => ({ x: p.x + halfX, y: p.y + halfY }))
    const node = AreaOutline.create(
      inside,
      Color.from(color) as any,
      this.alpha + 0.6,
    )
    cv.interface.grid.addChild(node)
    HighlightLayer.nodes.set(this.name, node)
  }

}
