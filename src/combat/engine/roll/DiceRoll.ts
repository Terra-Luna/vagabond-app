import { DiceRollSchema } from "../../../apps/attack-builder/model/DieRollSchema"
import { RelicPowerProcessor } from "../../../apps/vagabond-tools/relic/RelicPowerProcessor"
import { getArmor, type HeroDataModel } from "../../../model/actor/HeroDataModel"
import { AlchemicalItemDataModel } from "../../../model/item/equip/AlchemicalItemDataModel"
import { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"

export class DiceRoll {
    count: number
    faces: number
    modifier?: number
    explodesOn?: number[]
    explodeOnCritOnly?: boolean
    extraDiceOnCrit?: number
    reroll?: number[]

    constructor(args: DiceRollSchema) {
        this.count = args.count
        this.faces = args.faces
        this.modifier = args.modifier
        this.explodesOn = args.explodesOn
        this.explodeOnCritOnly = args.explodeOnCritOnly
        this.extraDiceOnCrit = args.extraDiceOnCrit
        this.reroll = args.reroll
    }

    toRollFormula(isCrit?: boolean): string {
        const mod = `${this.modifier ? `+${this.modifier}` : ''}`
        const explode = `${(this.explodesOn?.length ?? 0) > 0 ? `!${this.explodeOnCritOnly ? '*' : ''}` : ''}`

        if (isCrit) this.count += (this.extraDiceOnCrit ?? 0)

        let reroll = ""
        this.reroll?.forEach(rr => {
            reroll += `rr${rr}`
        })

        if (this.count > 0) {
            return `${this.count}d${this.faces}${reroll}${explode}${mod}`
        }
        else {
            return `${this.faces}${reroll}${explode}${mod}`
        }
    }

    static getItemDamageWithHeroMods = (hero: HeroDataModel, skill: string, item: AlchemicalItemDataModel | WeaponDataModel): DiceRollSchema => {
        const mods = foundry.utils.deepClone(hero.modifiers).damage.out
        const isVicious = item instanceof WeaponDataModel ? (item.properties.includes('vicious') || item.skills.some(sk => mods[sk]?.weaponProps?.includes('vicious'))) : false
        const isDefense = item instanceof WeaponDataModel ? (item.properties.includes('defense') || item.skills.some(sk => mods[sk]?.weaponProps?.includes('defense'))) : false
        const isThrown = item instanceof WeaponDataModel ? (item.properties.includes('thrown') || item.skills.some(sk => mods[sk]?.weaponProps?.includes('thrown'))) : false
        const isOneHandVersBonus = mods[skill]?.dice?.size?.oneHandVersatile || isDefense && mods.defense.dice.size.oneHandVersatile

        const versatileBonus = item instanceof WeaponDataModel
            ? ((item.grip.style === 'V' && (item.grip.state === 'HH' || (item.grip.state === 'H' && isOneHandVersBonus))) ? 2 : 0)
            : 0

        if (item instanceof WeaponDataModel) {
            RelicPowerProcessor.applyRelicPowers(item.relicPowers as any, mods)
        }

        let flatBonus = item.damage.dice.modifier ?? 0
        flatBonus += mods[skill]?.bonus?.flat ?? 0

        if (getArmor(hero)) {
            const armoredMods = mods[isDefense ? 'defense' : skill]?.conditional?.armored
            flatBonus += armoredMods?.bonus?.flat ?? 0
        }

        let dieSize = 
            Math.max(mods[skill]?.dice.size.min ?? 0, item.damage.dice.faces)
            + versatileBonus
            + (mods[skill]?.dice.size.bonus ?? 0)
            + (isDefense ? mods.defense.dice.size.bonus : 0)
            + (isThrown ? mods.thrown.dice.size.bonus : 0)

        if (dieSize > 12) {
            const diff = dieSize - 12
            dieSize = 12
            flatBonus += diff / 2
        }

        const explodesOnCrit = mods[skill]?.dice.crit?.explodes
        const globalMaxExplode = mods.global.dice.exploding.max
        const globalSubMaxExplode = mods.global.dice.exploding.subMax
        const explodesOn = [
            ...item.damage.dice.explodesOn ?? [],
            ...mods[skill]?.dice.exploding.values ?? [],
            ...mods[skill]?.dice.exploding.max ? [dieSize] : [],
            ...explodesOnCrit || globalMaxExplode ? [dieSize] : [],
        ]
        if (globalSubMaxExplode) {
            explodesOn.push(dieSize - 1)
        }

        const extraDiceOnCrit =
            (isVicious ? 1 : 0)
            + (mods[skill]?.dice.crit.extraDice ?? 0)

        const reroll = item instanceof WeaponDataModel
            ? mods[skill]?.dice.reroll?.[item.grip.state] ?? []
            : []

        return {
            count: item.damage.dice.count,
            faces: dieSize,
            modifier: flatBonus,
            explodesOn: explodesOn ?? [],
            explodeOnCritOnly: explodesOnCrit ?? false,
            extraDiceOnCrit: extraDiceOnCrit ?? 0,
            reroll: reroll
        }
    }

}