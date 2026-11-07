import type { Point } from "../AreaTypes"
import { AreaShape } from "./AreaShape"

export class ConeShape extends AreaShape {

  static readonly ANGLE = 65

  constructor(
    private readonly origin: Point,
    private readonly rotation: number,
    private readonly length: number,
    private readonly angle = ConeShape.ANGLE,
  ) {
    super()
  }

  contains(point: Point) {
    const dx = point.x - this.origin.x
    const dy = point.y - this.origin.y
    if (Math.hypot(dx, dy) > this.length + 1e-6) return false
    const facing = ((this.rotation + 90) * Math.PI) / 180
    const offset = Math.atan2(dy, dx) - facing
    const delta = Math.abs(Math.atan2(Math.sin(offset), Math.cos(offset)))
    return delta <= (this.angle * Math.PI) / 360 + 1e-6
  }

}
