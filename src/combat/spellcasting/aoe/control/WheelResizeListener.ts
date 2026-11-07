import { CanvasPreview } from "./CanvasPreview"
import { WheelStep } from "./WheelStep"

type WheelResizeOptions = {
  /** Current size in feet; read on every event so the listener never goes stale. */
  getSize: () => number
  minSize: number
  step: number
  onResize: (size: number) => void
}

/** Lets Shift+scroll over the canvas resize an area. */
export class WheelResizeListener extends CanvasPreview {

  private readonly stepper: WheelStep

  constructor(private readonly options: WheelResizeOptions) {
    super()
    this.stepper = new WheelStep(options.step, options.minSize)
  }

  start() {
    this.view?.addEventListener("wheel", this.onWheel, {
      capture: true,
      passive: false,
    })
  }

  stop() {
    this.view?.removeEventListener("wheel", this.onWheel, true)
  }

  private onWheel = (event: WheelEvent) => {
    if (!event.shiftKey) return
    event.preventDefault()
    event.stopImmediatePropagation()
    const next = this.stepper.change(this.options.getSize(), event)
    if (next !== undefined) this.options.onResize(next)
  }

}
