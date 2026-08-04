export class DiceRoll {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]

    constructor(args: { count: number, faces: number, modifier?: number, explodesOn?: number[] }) {
        this.count = args.count
        this.faces = args.faces
        this.modifier = args.modifier
        this.explodesOn = args.explodesOn
    }

    toRollFormula(): string {
        const mod = `${this.modifier ? `+${this.modifier}` : ''}`
        if (this.count > 0) return `${this.count}d${this.faces}${mod}`
        else return `${this.faces}${mod}`
    }

}