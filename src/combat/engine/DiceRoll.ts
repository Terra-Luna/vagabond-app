import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"

export interface DiceRollSchema {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]
    explodeOnCritOnly?: boolean
    extraDiceOnCrit?: number
}

export class DiceRoll {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]
    explodeOnCritOnly?: boolean
    extraDiceOnCrit?: number

    constructor(args: DiceRollSchema) {
        this.count = args.count
        this.faces = args.faces
        this.modifier = args.modifier
        this.explodesOn = args.explodesOn
        this.explodeOnCritOnly = args.explodeOnCritOnly
        this.extraDiceOnCrit = args.extraDiceOnCrit
    }

    toRollFormula(isCrit?: boolean): string {
        const mod = `${this.modifier ? `+${this.modifier}` : ''}`
        const explode = `${(this.explodesOn?.length ?? 0) > 0 ? `!${this.explodeOnCritOnly ? '*' : ''}` : ''}`

        if (isCrit) this.count += (this.extraDiceOnCrit ?? 0)

        if (this.count > 0) {
            return `${this.count}d${this.faces}${explode}${mod}`
        }
        else {
            return `${this.faces}${explode}${mod}`
        }
    }

    static getWeaponDamageWithHeroMods = (hero: HeroDataModel, skill: string, weapon: WeaponDataModel): DiceRollSchema => {
        const mods = hero.modifiers
        const isVicious = weapon.properties.includes('vicious')
        const isDefense = weapon.properties.includes('defense')
        const isThrown = weapon.skills.includes('thrown')
        const versatileBonus = (weapon.grip.style === 'V' && weapon.grip.state === 'HH') ? 2 : 0

        const dieSize =
            Math.max(mods.dice.size[skill]?.minimum ?? 0, weapon.damage.dice.faces) +
            versatileBonus +
            (mods.dice.size[skill]?.bonus ?? 0) +
            (isDefense ? mods.dice.size['defense']?.bonus : 0) +
            (isThrown ? mods.dice.size['thrown']?.bonus : 0)

        const explodesOn = mods.dice.exploding[skill]?.values
        const explodesOnCrit = mods.dice.crit[skill]?.explodes
        if (explodesOnCrit) explodesOn.push(dieSize)

        const extraDiceOnCrit =
            (isVicious ? 1 : 0) +
            (mods.dice.crit[skill]?.extraDice ?? 0)

        return {
            count: weapon.damage.dice.count,
            faces: dieSize,
            modifier: weapon.damage.dice.modifier,
            explodesOn: explodesOn,
            explodeOnCritOnly: explodesOnCrit,
            extraDiceOnCrit: extraDiceOnCrit
        }
    }

}