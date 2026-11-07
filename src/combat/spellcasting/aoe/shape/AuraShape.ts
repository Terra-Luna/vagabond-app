import type { Point, Rect } from "../AreaTypes"
import { AreaShape } from "./AreaShape"

export class AuraShape extends AreaShape {

  constructor(
    private readonly tokenRect: Rect,
    private readonly radius: number,
    private readonly pixelsPerUnit: number,
    private readonly chebyshev: boolean,
  ) {
    super()
  }

  static gapToRect(point: Point, rect: Rect, chebyshev: boolean) {
    const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width))
    const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height))
    return chebyshev ? Math.max(dx, dy) : Math.hypot(dx, dy)
  }

  contains(point: Point) {
    return (
      AuraShape.gapToRect(point, this.tokenRect, this.chebyshev) <=
      this.radius * this.pixelsPerUnit
    )
  }

}
