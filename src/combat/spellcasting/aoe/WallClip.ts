import type { Point } from "./AreaTypes"

/** Keeps spell areas from reaching through walls that block movement. */
export class WallClip {

  /** The points with an unobstructed straight line from `origin`; the origin's own square is always kept. */
  static reachable(origin: Point, points: Point[]): Point[] {
    const backend = (CONFIG as any)?.Canvas?.polygonBackends?.move
    if (!backend?.testCollision || !(canvas as any)?.ready) return points
    return points.filter(
      (p) =>
        (p.x === origin.x && p.y === origin.y) ||
        !backend.testCollision(origin, p, { type: "move", mode: "any" }),
    )
  }

}
