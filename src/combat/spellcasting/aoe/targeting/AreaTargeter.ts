import type { Point } from "../AreaTypes"
import { AreaOccupants } from "./AreaOccupants"

/** Targets the tokens standing in an area that a spell's auto-targeting preference selects. */
export class AreaTargeter {

  /** Targets exactly the visible tokens in the given square centers that match `pref`. Does nothing for "none". */
  target(points: Point[], pref: string | undefined) {
    if (pref !== "hostile" && pref !== "friendly" && pref !== "all") return
    const cv = canvas as any
    const user = game.user as any
    if (!cv?.ready || !user) return
    const wanted = new Set<any>(AreaOccupants.targetsIn(points, pref))

    const current = new Set<any>(user.targets)
    if (
      current.size === wanted.size &&
      [...wanted].every((t) => current.has(t))
    )
      return
    const opts = { releaseOthers: false, groupSelection: true }
    for (const t of current) if (!wanted.has(t)) t.setTarget(false, opts)
    for (const t of wanted) if (!current.has(t)) t.setTarget(true, opts)
    user.broadcastActivity?.({ targets: user.targets.ids })
  }

}
