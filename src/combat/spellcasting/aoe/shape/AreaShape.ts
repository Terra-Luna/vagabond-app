import type { Point } from "../AreaTypes"

/** A region of the map, able to say which grid square centers it covers. */
export abstract class AreaShape {

  abstract contains(point: Point): boolean

  select(centers: Point[]): Point[] {
    return centers.filter((c) => this.contains(c))
  }

}
