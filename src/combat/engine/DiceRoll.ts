export interface DiceRollSchema {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]
    explodeOnCritOnly?: boolean
    extraDieOnCrit?: boolean
}

export class DiceRoll {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]
    explodeOnCritOnly?: boolean
    extraDieOnCrit?: boolean

    constructor(args: DiceRollSchema) {
        this.count = args.count
        this.faces = args.faces
        this.modifier = args.modifier
        this.explodesOn = args.explodesOn
        this.explodeOnCritOnly = args.explodeOnCritOnly
        this.extraDieOnCrit = args.extraDieOnCrit
    }

    toRollFormula(isCrit?: boolean): string {
        const mod = `${this.modifier ? `+${this.modifier}` : ''}`
        const explode = `${(this.explodesOn?.length ?? 0) > 0 ? `!${this.explodeOnCritOnly ? '*' : ''}` : ''}`

        if (isCrit && this.extraDieOnCrit) this.count += 1

        if (this.count > 0) {
            return `${this.count}d${this.faces}${explode}${mod}`
        }
        else {
            return `${this.faces}${explode}${mod}`
        }
    }

}