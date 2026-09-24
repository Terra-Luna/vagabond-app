export interface DiceRollSchema {
    count: number
    faces: number
    modifier?: number
    perDieBonus?: number
    explodesOn?: number[]
    explodeOnCritOnly?: boolean
    extraDiceOnCrit?: number
    reroll?: number[]
}