import type { AreaRenderer } from "../AreaRenderer"
import { CanvasPreview } from "./CanvasPreview"
import { WheelStep } from "./WheelStep"

type WheelResizeOptions = {
  /** Current size in feet; read on every event so the listener never goes stale. */
  getSize: () => number
  minSize: number
  step: number
  onResize: (size: number) => void
  onReEnable?: () => void
}

/** Lets Shift+scroll over the canvas resize an area. */
export class WheelResizeListener extends CanvasPreview {

  private readonly stepper: WheelStep
  private renderer?: AreaRenderer

  constructor(private readonly options: WheelResizeOptions, renderer?: AreaRenderer) {
    super()
    this.stepper = new WheelStep(options.step, options.minSize)
    this.renderer = renderer
  }

  start() {
    this.view?.addEventListener("wheel", this.onWheel, {
      capture: true,
      passive: false,
    })
    this.view?.addEventListener("pointerdown", this.onRightClick, true)
  }

  stop() {
    this.view?.removeEventListener("wheel", this.onWheel, true)
    this.view?.removeEventListener("pointerdown", this.onRightClick, true)
  }

  private onWheel = (event: WheelEvent) => {
    if (!this.isEnabled) return
    if (!event.shiftKey) return
    event.preventDefault()
    event.stopImmediatePropagation()
    const next = this.stepper.change(this.options.getSize(), event)
    if (next !== undefined) this.options.onResize(next)
  }

  private onRightClick = (event: PointerEvent) => {
    if (event.button !== 2) return
    event.preventDefault()
    event.stopImmediatePropagation()
    this.toggleEnabled()
    if (!this.isEnabled) {
      this.renderer?.clear()
    }
  }

  protected onReEnabled() {
    this.options.onReEnable?.()
  }

}
