import type { Point } from "../AreaTypes"

/** "all" is not a spell setting: it is what every non-Aura delivery uses. */
export type AutoTargetingPref = "none" | "hostile" | "friendly" | "all"

/** Finds the tokens standing in an area. */
export class AreaOccupants {

  /** Whether a spell with this preference auto-targets a token with the given disposition. */
  static matches(pref: string | undefined, disposition: number): boolean {
    const d = (CONST as any).TOKEN_DISPOSITIONS
    if (pref === "all") return true
    if (pref === "hostile") return disposition === d.HOSTILE
    if (pref === "friendly")
      return disposition === d.FRIENDLY || disposition === d.NEUTRAL
    return false
  }

  /** Visible scene tokens occupying any of the given square centers; `hostileOnly` keeps only Hostile ones. */
  static tokensIn(points: Point[], hostileOnly = false): any[] {
    return AreaOccupants.occupants(points, (d) =>
      hostileOnly ? d === (CONST as any).TOKEN_DISPOSITIONS.HOSTILE : true,
    )
  }

  static hostilesIn(points: Point[]) {
    return AreaOccupants.tokensIn(points, true)
  }

  /** The tokens in the area that a spell with the given auto-targeting preference targets. */
  static targetsIn(points: Point[], pref: string | undefined): any[] {
    return AreaOccupants.occupants(points, (d) =>
      AreaOccupants.matches(pref, d),
    )
  }

  private static occupants(
    points: Point[],
    allow: (disposition: number) => boolean,
  ): any[] {
    const cv = canvas as any
    if (!cv?.ready || !points.length) return []
    const grid = cv.grid
    return (cv.tokens.placeables as any[]).filter((token) => {
      const doc = token.document
      if (doc.hidden || !allow(doc.disposition)) return false
      if (doc.actor?.type === "itemActor") return false
      const [x, y] = [doc.x, doc.y]
      const [w, h] = [doc.width * grid.size, doc.height * grid.size]
      return points.some(
        (p) => p.x >= x && p.x < x + w && p.y >= y && p.y < y + h,
      )
    })
  }

}
