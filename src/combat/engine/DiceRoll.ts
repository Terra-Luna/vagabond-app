import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"

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

    static getWeaponDamageWithHeroMods = (hero: HeroDataModel, weapon: WeaponDataModel): DiceRollSchema => {
        const isRangedWeapon = weapon.skills.includes('ranged')
        const mods = hero.modifiers
        const dieSizeMod = isRangedWeapon
            ? mods.dice.size.ranged
            : mods.dice.size.melee

        const dieSize = weapon.damage.dice.faces + (dieSizeMod ?? 0)

        const explMod = isRangedWeapon
            ? mods.dice.exploding.ranged || mods.dice.exploding.rangedCrit
            : mods.dice.exploding.melee || mods.dice.exploding.meleeCrit

        const explodesOn = explMod
            ? [...new Set([...(weapon.damage.dice.explodesOn as number[] || []), dieSize])].sort((a, b) => a - b)
            : weapon.damage.dice.explodesOn as number[]

        const critOnly = isRangedWeapon
            ? mods.dice.exploding.rangedCrit && !mods.dice.exploding.ranged
            : mods.dice.exploding.meleeCrit && !mods.dice.exploding.melee

        const extraDieOnCrit = isRangedWeapon
            ? mods.dice.crit.rangedExtraDie
            : mods.dice.crit.meleeExtraDie

        return {
            count: weapon.damage.dice.count,
            faces: dieSize,
            modifier: weapon.damage.dice.modifier,
            explodesOn: explodesOn,
            explodeOnCritOnly: critOnly,
            extraDieOnCrit: extraDieOnCrit || weapon.properties.includes('vicious')
        }
    }

}