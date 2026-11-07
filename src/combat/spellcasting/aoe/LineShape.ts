import { Point } from "./AreaTypes"
import { AreaShape } from "./shape/AreaShape"

export class LineShape extends AreaShape {

  private readonly direction: Point
  private readonly half: number
  private readonly low: number
  private readonly high: number

  constructor(
    private readonly origin: Point,
    angle: number,
    private readonly length: number,
    width: number,
    private readonly pixelsPerUnit: number,
  ) {
    super()
    const rad = (angle * Math.PI) / 180
    this.direction = { x: Math.cos(rad), y: Math.sin(rad) }
    this.half = 2.5 * pixelsPerUnit
    const cells = Math.max(1, Math.round(width / 5))
    this.low = -Math.floor((cells - 1) / 2) * 5 * pixelsPerUnit
    this.high = Math.ceil((cells - 1) / 2) * 5 * pixelsPerUnit
  }

  contains(point: Point) {
    const eps = 1e-6
    const [rx, ry] = [point.x - this.origin.x, point.y - this.origin.y]
    const { x: dx, y: dy } = this.direction
    const along = rx * dx + ry * dy
    const across = -rx * dy + ry * dx
    return (
      along >= -this.half - eps &&
      along <= this.length * this.pixelsPerUnit - this.half + eps &&
      across >= this.low - eps &&
      across <= this.high + eps
    )
  }

}
