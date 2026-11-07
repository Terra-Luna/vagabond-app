import type { AreaRenderer } from "../AreaRenderer"
import type { Point } from "../AreaTypes"
import { PlacedAreaPreview } from "./PlacedAreaPreview"
import { WheelStep } from "./WheelStep"

type LinePreviewOptions = {
  getLength: () => number
  getWidth: () => number
  lengthStep: number
  minLength: number
  widthStep: number
  minWidth: number
  onLength: (feet: number) => void
  onWidth: (feet: number) => void
  onArea?: (covered: Point[]) => void
}

/** A Line's area: Shift+scroll changes its length, Alt+scroll its width and Ctrl+scroll turns it 45 degrees. */
export class LinePreview extends PlacedAreaPreview {

  private static readonly TURN = 45
  private angle = 0
  private readonly lengthStepper: WheelStep
  private readonly widthStepper: WheelStep

  constructor(
    renderer: AreaRenderer,
    private readonly options: LinePreviewOptions,
  ) {
    super(renderer, options.onArea)
    this.lengthStepper = new WheelStep(options.lengthStep, options.minLength)
    this.widthStepper = new WheelStep(options.widthStep, options.minWidth)
  }

  protected render(point: Point, pinned: boolean) {
    return this.renderer.showLine(
      point,
      this.angle,
      this.options.getLength(),
      this.options.getWidth(),
      pinned,
    )
  }

  protected handleWheel(event: WheelEvent) {
    if (event.shiftKey) {
      const next = this.lengthStepper.change(this.options.getLength(), event)
      if (next !== undefined) this.options.onLength(next)
    }
    else if (event.altKey) {
      const next = this.widthStepper.change(this.options.getWidth(), event)
      if (next !== undefined) this.options.onWidth(next)
    }
    else if (event.ctrlKey) {
      const delta = event.deltaY || event.deltaX
      const turn = delta > 0 ? LinePreview.TURN : -LinePreview.TURN
      this.angle = (this.angle + turn + 360) % 360
      this.refresh()
    }
    else return false
    return true
  }

}
