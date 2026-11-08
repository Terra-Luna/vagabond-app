export interface ParsedDamageFormula {
  dice: { count: number; faces: number }[]
  flat: number
}

/** Reads a typed-in damage formula such as "1d6", "d8 + 2", "2d4+1d6-1" or "3". */
export class DamageFormulaUtil {

  /** The dice and flat bonus a formula describes, or undefined when it is blank or isn't a damage formula. */
  static parse(
    text: string | null | undefined,
  ): ParsedDamageFormula | undefined {
    const formula = (text ?? "").replace(/\s+/g, "").toLowerCase()
    if (!formula) return undefined
    const terms = formula.match(/[+-]?[^+-]+/g)
    if (!terms || terms.join("") !== formula) return undefined

    const result: ParsedDamageFormula = { dice: [], flat: 0 }
    for (const term of terms) {
      const sign = term.startsWith("-") ? -1 : 1
      const body = term.replace(/^[+-]/, "")
      const dice = body.match(/^(\d*)d(\d+)$/)
      if (dice) {
        const count = dice[1] === "" ? 1 : Number(dice[1])
        const faces = Number(dice[2])
        if (faces < 1) return undefined
        // A subtracted die can't be rolled as damage, so only added dice are kept.
        if (sign < 0) return undefined
        if (count > 0) result.dice.push({ count, faces })
      }
      else if (/^\d+$/.test(body)) result.flat += sign * Number(body)
      else return undefined
    }
    return result.dice.length || result.flat ? result : undefined
  }

}
