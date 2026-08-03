export class DiceRoll {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]

    constructor(count: number, faces: number, modifier?: number, explodesOn?: number[]) {
        this.count = count
        this.faces = faces
        this.modifier = modifier
        this.explodesOn = explodesOn
    }

    toRollFormula(): string {
        const mod = `${this.modifier ? `+${this.modifier}` : ''}`
        if (this.count > 0) return `${this.count}d${this.faces}${mod}`
        else return `${this.faces}${mod}`
    }

}