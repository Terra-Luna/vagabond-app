export interface DiceRollSchema {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]
    explodeOnCritOnly?: boolean
    extraDiceOnCrit?: number
}