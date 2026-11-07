import type { AreaRenderer } from "../AreaRenderer"
import type { Point } from "../AreaTypes"
import { CanvasPreview } from "./CanvasPreview"

type CubePreviewOptions = {
  /** Called with the number of placed squares after each placement or removal. */
  onCount?: (count: number) => void
  /** Called with the centers of the placed squares after each placement or removal. */
  onArea?: (covered: Point[]) => void
  /** When set, placing past this many squares replaces the oldest one. */
  limit?: number
  /** Image drawn in each placed square. */
  icon?: string
}

/** Lets the caster click grid squares to drop 5' squares (Cubes or a Glyph); clicking a placed one removes it. */
export class CubePreview extends CanvasPreview {

  private placed = new Map<string, Point>()
  private hover?: Point

  constructor(
    private readonly renderer: AreaRenderer,
    private readonly options: CubePreviewOptions,
  ) {
    super()
  }

  start() {
    this.view?.addEventListener("pointermove", this.onMove)
    this.view?.addEventListener("pointerdown", this.onClick, true)
  }

  stop() {
    this.view?.removeEventListener("pointermove", this.onMove)
    this.view?.removeEventListener("pointerdown", this.onClick, true)
    cancelAnimationFrame(this.frame)
    this.renderer.clear()
    this.renderer.clearPinned()
  }

  private keyOf(point: Point) {
    const { i, j } = (canvas as any).grid.getOffset(point)
    return `${i},${j}`
  }

  private draw() {
    const points = [...this.placed.values()]
    const covered = this.renderer.showCubes(points, this.hover)
    const { icon } = this.options
    if (icon) this.renderer.showIcons(points, icon)
    return covered
  }

  private place(key: string, point: Point) {
    const { limit } = this.options
    if (limit && this.placed.size >= limit) {
      const oldest = this.placed.keys().next().value
      if (oldest !== undefined) this.placed.delete(oldest)
    }
    this.placed.set(key, point)
  }

  private onMove = (event: PointerEvent) => {
    this.hover = this.toWorld(event)
    this.schedule(() => this.draw())
  }

  private onClick = (event: PointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopImmediatePropagation()
    const point = this.toWorld(event)
    if (!point) return
    const key = this.keyOf(point)
    if (this.placed.has(key)) this.placed.delete(key)
    else this.place(key, point)
    const covered = this.draw()
    this.options.onArea?.(covered)
    this.options.onCount?.(this.placed.size)
  }

}
