import type { Point, Rect } from "../AreaTypes"
import { AreaShape } from "./AreaShape"
import { AuraShape } from "./AuraShape"

export class SphereShape extends AreaShape {

  constructor(
    private readonly originSquare: Rect,
    private readonly radius: number,
    private readonly pixelsPerUnit: number,
  ) {
    super()
  }

  contains(point: Point) {
    return (
      AuraShape.gapToRect(point, this.originSquare, false) <=
      this.radius * this.pixelsPerUnit + 1e-6
    )
  }

}
