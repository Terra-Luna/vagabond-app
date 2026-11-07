import type { Point } from "../AreaTypes"
import { AreaShape } from "./AreaShape"

export class SphereShape extends AreaShape {

  constructor(
    private readonly origin: Point,
    private readonly radius: number,
    private readonly pixelsPerUnit: number,
  ) {
    super()
  }

  contains(point: Point) {
    return (
      Math.hypot(point.x - this.origin.x, point.y - this.origin.y) <=
      this.radius * this.pixelsPerUnit + 1e-6
    )
  }

}
