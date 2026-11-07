import type { AreaRenderer } from "../AreaRenderer"
import type { Point } from "../AreaTypes"
import { CanvasPreview } from "./CanvasPreview"

/**
 * Makes an area follow the mouse over the canvas; a click pins it in place (click again to release it).
 * While active, left clicks and the wheel events a subclass handles are consumed.
 */
export abstract class PlacedAreaPreview extends CanvasPreview {

  private cursor?: Point
  private pinned = false

  constructor(
    protected readonly renderer: AreaRenderer,
    private readonly onArea?: (covered: Point[]) => void,
  ) {
    super()
  }

  /** Draws the area at the point, on the pinned layer when `pinned`, and returns the squares it covers. */
  protected abstract render(point: Point, pinned: boolean): Point[]

  /** Handles a wheel event and returns true when it was consumed. */
  protected abstract handleWheel(event: WheelEvent): boolean

  start() {
    this.view?.addEventListener("pointermove", this.onMove)
    this.view?.addEventListener("pointerdown", this.onClick, true)
    this.view?.addEventListener("wheel", this.onWheel, {
      capture: true,
      passive: false,
    })
  }

  stop() {
    this.view?.removeEventListener("pointermove", this.onMove)
    this.view?.removeEventListener("pointerdown", this.onClick, true)
    this.view?.removeEventListener("wheel", this.onWheel, true)
    cancelAnimationFrame(this.frame)
    this.renderer.clear()
    this.renderer.clearPinned()
  }

  /** Redraws after a size or rotation change, keeping a pinned area where it was. */
  refresh() {
    if (this.pinned && this.cursor)
      this.onArea?.(this.render(this.cursor, true))
    else this.draw()
  }

  private draw() {
    if (this.pinned || !this.cursor) return
    this.render(this.cursor, false)
  }

  private onMove = (event: PointerEvent) => {
    if (this.pinned) return
    this.cursor = this.toWorld(event)
    this.schedule(() => this.draw())
  }

  private onClick = (event: PointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopImmediatePropagation()
    const point = this.toWorld(event)
    if (!point) return

    this.cursor = point
    if (this.pinned) {
      this.pinned = false
      this.renderer.clearPinned()
      this.onArea?.([])
      this.draw()
      return
    }
    this.pinned = true
    this.renderer.clear()
    this.onArea?.(this.render(point, true))
  }

  private onWheel = (event: WheelEvent) => {
    if (!this.handleWheel(event)) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }

}
