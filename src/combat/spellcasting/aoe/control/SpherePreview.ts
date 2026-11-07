import type { AreaRenderer } from "../AreaRenderer"
import type { Point } from "../AreaTypes"
import { PlacedAreaPreview } from "./PlacedAreaPreview"
import { WheelStep } from "./WheelStep"

type SpherePreviewOptions = {
  /** Current radius in feet; read on every event so the preview never goes stale. */
  getSize: () => number
  minSize: number
  step: number
  /** Called when Shift+scroll asks for a different radius. */
  onResize: (size: number) => void
  onArea?: (covered: Point[]) => void
}

/** A Sphere's area: Shift+scroll resizes it. */
export class SpherePreview extends PlacedAreaPreview {

  private readonly stepper: WheelStep

  constructor(
    renderer: AreaRenderer,
    private readonly options: SpherePreviewOptions,
  ) {
    super(renderer, options.onArea)
    this.stepper = new WheelStep(options.step, options.minSize)
  }

  protected render(point: Point, pinned: boolean) {
    return this.renderer.showSphere(point, this.options.getSize(), pinned)
  }

  protected handleWheel(event: WheelEvent) {
    if (!event.shiftKey) return false
    const next = this.stepper.change(this.options.getSize(), event)
    if (next !== undefined) this.options.onResize(next)
    return true
  }

}
