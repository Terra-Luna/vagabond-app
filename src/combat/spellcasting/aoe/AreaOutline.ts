import type { Point } from "./AreaTypes"

/** Corner rounding of area outlines, in pixels (Tailwind's rounded-md is 0.375rem = 6px). */
export const AREA_FILL_ALPHA = 0.04
export const CORNER_RADIUS = 8

export class AreaOutline {

  /** A graphics object outlining and faintly filling the cells (each given by any point inside it). */
  static create(cells: Point[], color: any, alpha: number, width = 3) {
    const grid = (canvas as any).grid
    const outline = new PIXI.Graphics()
    outline.beginFill(color, AREA_FILL_ALPHA)
    for (const cell of cells) {
      const vertices = grid.getVertices(cell) as Point[]
      outline.drawPolygon(vertices.flatMap((v) => [v.x, v.y]))
    }
    outline.endFill()
    outline.lineStyle(width, color, alpha)
    for (const loop of AreaOutline.loops(AreaOutline.perimeter(cells)))
      AreaOutline.traceRounded(outline, loop)
    return outline
  }

  /** Chains the perimeter segments into closed loops of corner points (collinear points dropped). */
  private static loops(edges: [Point, Point][]): Point[][] {
    const keyOf = (p: Point) => `${Math.round(p.x)},${Math.round(p.y)}`
    const byStart = new Map<string, [Point, Point][]>()
    for (const e of edges) {
      const list = byStart.get(keyOf(e[0])) ?? []
      list.push(e)
      byStart.set(keyOf(e[0]), list)
      const rev: [Point, Point] = [e[1], e[0]]
      const other = byStart.get(keyOf(rev[0])) ?? []
      other.push(rev)
      byStart.set(keyOf(rev[0]), other)
    }
    const used = new Set<[Point, Point]>()
    const sameEdge = (a: [Point, Point], b: [Point, Point]) =>
      keyOf(a[0]) === keyOf(b[1]) && keyOf(a[1]) === keyOf(b[0])
    const loops: Point[][] = []
    for (const first of edges) {
      if (used.has(first)) continue
      const points: Point[] = [first[0]]
      let current: [Point, Point] = first
      for (;;) {
        used.add(current)
        for (const [, list] of byStart)
          for (const e of list) if (sameEdge(e, current)) used.add(e)
        const end = current[1]
        if (keyOf(end) === keyOf(first[0])) break
        const next = (byStart.get(keyOf(end)) ?? []).find(
          (e) =>
            !sameEdge(e, current) &&
            ![...used].some((u) => u === e || sameEdge(u, e)),
        )
        if (!next) break
        points.push(end)
        current = next
      }
      loops.push(AreaOutline.withoutCollinear(points))
    }
    return loops.filter((l) => l.length >= 3)
  }

  private static withoutCollinear(points: Point[]): Point[] {
    return points.filter((p, i) => {
      const a = points[(i + points.length - 1) % points.length]
      const b = points[(i + 1) % points.length]
      const cross = (p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x)
      return Math.abs(cross) > 1e-6
    })
  }

  /** Draws a closed loop with each corner rounded to `CORNER_RADIUS`. */
  private static traceRounded(g: any, loop: Point[]) {
    const n = loop.length
    const toward = (from: Point, to: Point, distance: number): Point => {
      const length = Math.hypot(to.x - from.x, to.y - from.y) || 1
      const t = Math.min(distance, length / 2) / length
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      }
    }
    const start = toward(loop[0], loop[1], Infinity)
    g.moveTo(start.x, start.y)
    for (let i = 1; i <= n; i++) {
      const corner = loop[i % n]
      const next = loop[(i + 1) % n]
      const entry = toward(corner, loop[i - 1], CORNER_RADIUS)
      g.lineTo(entry.x, entry.y)
      const exit = toward(corner, next, CORNER_RADIUS)
      g.quadraticCurveTo(corner.x, corner.y, exit.x, exit.y)
    }
    g.closePath()
  }

  /** The outer edges of the cells as line segments. */
  static perimeter(cells: Point[]): [Point, Point][] {
    const grid = (canvas as any).grid
    // Edges shared by two squares are interior; only the perimeter is kept.
    const edges = new Map<string, [Point, Point]>()
    const interior = new Set<string>()
    for (const cell of cells) {
      const vertices = grid.getVertices(cell) as Point[]
      vertices.forEach((a, i) => {
        const b = vertices[(i + 1) % vertices.length]
        const key = [a, b]
          .map((v) => `${Math.round(v.x)},${Math.round(v.y)}`)
          .sort()
          .join("|")
        if (edges.has(key)) interior.add(key)
        else edges.set(key, [a, b])
      })
    }
    return [...edges].filter(([key]) => !interior.has(key)).map(([, e]) => e)
  }

  /** Distance from a point to a line segment. */
  static distanceToSegment(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const lengthSq = dx * dx + dy * dy
    const t = lengthSq
      ? Math.max(
          0,
          Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq),
        )
      : 0
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
  }

}
