import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

import { getDiceTerms } from "../util/dice-utils"
import { DiceRoll } from "./DiceRoll"
import { RollSummary } from "./RollSummary"

export interface DamageRollArgs {
    atkName: string
    dice: DiceRoll[]
    dmgType?: string
    flatDmgBonus?: number
    perDieDmgBonus?: number
    armorPiercing?: number
    armorPiercingPerDie?: number
    armorPiercingPerExtraDie?: number
    relicLevel?: number
}

export interface DamageRollResult {
    atkName: string
    dmgType: string
    bonus: number
    total: number
    armorPiercing: number
    rollSummaries: RollSummary[]
    rolls: Roll.Evaluated<Roll<EmptyObject>>[]
}

export class DamageRoll {
    atkName: string
    dmgType: string
    dice: DiceRoll[]
    flatDmgBonus: number
    perDieDmgBonus: number
    armorPiercing: number
    armorPiercingPerDie: number
    armorPiercingPerExtraDie: number
    relicLevel: number
    result: DamageRollResult | undefined

    constructor(args: DamageRollArgs) {
        this.atkName = args.atkName
        this.dice = args.dice
        this.dmgType = args.dmgType ?? 'physical'
        this.flatDmgBonus = args.flatDmgBonus ?? 0
        this.perDieDmgBonus = args.perDieDmgBonus ?? 0
        this.armorPiercing = args.armorPiercing ?? 0
        this.armorPiercingPerDie = args.armorPiercingPerDie ?? 0
        this.armorPiercingPerExtraDie = args.armorPiercingPerExtraDie ?? 0
        this.relicLevel = args.relicLevel ?? -1
    }

    toString(): string {
        return this.dice.map(d => {
            let formula = `${d.count}d${d.faces}`
            if (d.explodesOn && d.explodesOn.length > 0) formula += `!`
            if (d.modifier) formula += `+${d.modifier}`
            return formula
        }).join('+')
    }

    toJson() {
        return {
            atkName: this.atkName,
            dice: this.dice,
            dmgType: this.dmgType,
            flatDmgBonus: this.flatDmgBonus,
            perDieDmgBonus: this.perDieDmgBonus,
            armorPiercing: this.armorPiercing,
            armorPiercingPerDie: this.armorPiercingPerDie,
            armorPiercingPerExtraDie: this.armorPiercingPerExtraDie,
            relicLevel: this.relicLevel,
            result: this.result
        }
    }

    static fromJson(json): DamageRoll | undefined {
        if (!json) return undefined
        try {
            const roll = new DamageRoll({
                atkName: json.atkName,
                dice: json.dice,
                dmgType: json.dmgType,
                flatDmgBonus: json.flatDmgBonus,
                perDieDmgBonus: json.perDieDmgBonus,
                armorPiercing: json.armorPiercing,
                armorPiercingPerDie: json.armorPiercingPerDie,
                armorPiercingPerExtraDie: json.armorPiercingPerExtraDie,
                relicLevel: json.relicLevel
            })
            roll.result = json.result
            return roll
        }
        catch (error) {
            console.error(error)
            return undefined
        }
    }

    async roll(isCrit?: boolean): Promise<DamageRollResult> {
        const straightRolls = this.dice.filter(d => !d.explodesOn || d.explodesOn.length === 0).map(d => new DiceRoll(d))
        const explodingRolls = this.dice.filter(d => d.explodesOn && d.explodesOn.length > 0).map(d => new DiceRoll(d))

        const straightForumla = `${straightRolls.map(it => it.toRollFormula(isCrit)).join("+")}`
        const damageRoll = await new Roll(straightForumla.length > 0 ? straightForumla : `0`).evaluate()
        const damageRollTerms = getDiceTerms(damageRoll)

        let initialExplodableRoll: Roll.Evaluated<Roll<EmptyObject>> = await new Roll(`0`).evaluate()
        let initialExplodableTerms: foundry.dice.terms.DiceTerm[] = []

        if (explodingRolls && explodingRolls.length > 0) {
            const formula = `${explodingRolls.map(it => it.toRollFormula(isCrit).replace("!", "").replace("*", "")).join("+")}`
            initialExplodableRoll = await new Roll(formula).evaluate()
            initialExplodableTerms = getDiceTerms(initialExplodableRoll)
        }

        const explosions: Roll.Evaluated<Roll<EmptyObject>>[] = []

        let canExplode = false
        for (const d of this.dice.filter(d => d.explodesOn && d.explodesOn.length > 0 && (isCrit && d.explodeOnCritOnly || !d.explodeOnCritOnly))) {
            if (this.isSafeToExplode(d.faces, d.explodesOn!, d.reroll ?? [])) {
                canExplode = true
                await this.processExplosions(initialExplodableTerms, explosions, d.explodesOn ?? [], d.reroll ?? [])
            }
        }

        const combinedExplosions = canExplode ? this.mergeExplosions([...explosions]) : null
        const explosionTerms = canExplode ? getDiceTerms(combinedExplosions!) : []
        const summaries = RollSummary.buildRollSummaries(damageRollTerms, initialExplodableTerms, explosionTerms, this.dice, isCrit)
        const totalDice = summaries.filter(it => !it.rerolled).length
        const perDieBonus = totalDice * (this.perDieDmgBonus ?? 0)
        const perDieArmorPiercing = totalDice * (this.armorPiercingPerDie ?? 0)
        const perExtraDieArmorPiercing = (totalDice - 1) * (this.armorPiercingPerExtraDie ?? 0)

        const totalBonus = perDieBonus
            + (this.flatDmgBonus ?? 0)
            + (straightRolls.reduce((acc, roll) => acc + (roll.modifier ?? 0), 0))
            + (explodingRolls.reduce((acc, roll) => acc + (roll.modifier ?? 0), 0))

        const result = {
            atkName: this.atkName,
            dmgType: this.dmgType,
            total: damageRoll.total + initialExplodableRoll.total + (combinedExplosions?.total ?? 0) + perDieBonus,
            bonus: totalBonus,
            armorPiercing: (this.armorPiercing ?? 0) + perDieArmorPiercing + perExtraDieArmorPiercing,
            rollSummaries: summaries,
            rolls: [damageRoll, ...(explodingRolls.length > 0 ? [initialExplodableRoll] : [])]
        } as DamageRollResult

        if (canExplode && combinedExplosions) result.rolls.push(combinedExplosions)

        this.result = result
        return result
    }

    /**
     * Recursive function to compound exploding dice into the given 'explosions' parameter.
     */
    private async processExplosions(
        damageRollTerms: foundry.dice.terms.DiceTerm[],
        explosions: Roll.Evaluated<Roll>[],
        explodesOn: number[],
        reroll: number[]
    ) {
        const count = damageRollTerms
            .flatMap(it => it.results)
            .filter(it => explodesOn.includes(it.result))
            .length
    
        if (count > 0) {
            let formula = `${count}d${damageRollTerms[0].faces}`
            if (reroll.length > 0) {
                formula += `rr${reroll.join('rr')}`
            }
            const explosionRoll = await new Roll(formula).evaluate()
            explosions.push(explosionRoll)
            await this.processExplosions(getDiceTerms(explosionRoll), explosions, explodesOn, reroll)
        }
    }
    
    private mergeExplosions(explosions: Roll.Evaluated<Roll<EmptyObject>>[]): Roll.Evaluated<Roll> | null {
        const combinedExplosionTerms = explosions.reduce<foundry.dice.terms.RollTerm[]>((sum, current, index) => {
            if (index > 0) {
                sum.push(new foundry.dice.terms.OperatorTerm({ operator: "+" }))
            }
            return sum.concat(current?.terms)
        }, [])

        if (combinedExplosionTerms?.length === 0) return null
        const combinedExplosions = Roll.fromTerms(combinedExplosionTerms)
        combinedExplosions["_evaluated"] = true
        combinedExplosions["_total"] = (combinedExplosions as any)._evaluateTotal()
        return combinedExplosions as Roll.Evaluated<Roll>
    }
    
    /**
     * Used to prevent infinitely exploding dice.
     */
    private isSafeToExplode(faces: number | undefined, explodesOn: number[], reroll: number[]): boolean {
        if (explodesOn.length === 0) return false
        for (let i = 1; i <= (faces ?? 0); i++) {
            if (explodesOn.indexOf(i) === -1 && reroll.indexOf(i) === -1) {
                return true
            }
        }
        ui.notifications?.warn("Invalid exploding dice config detected (infinite recursion). Please check your exploding dice and reroll settings.")
        return false
    }

}