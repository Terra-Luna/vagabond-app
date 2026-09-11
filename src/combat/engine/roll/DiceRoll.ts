import { DiceRollSchema } from "../../../apps/attack-builder/model/DieRollSchema"
import { RelicPowerProcessor } from "../../../apps/vagabond-tools/relic/RelicPowerProcessor"
import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
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
            return `${this.count}d${this.faces}${explode}${mod}${reroll}`
        }
        else {
            return `${this.faces}${explode}${mod}${reroll}`
        }
    }

    static getItemDamageWithHeroMods = (hero: HeroDataModel, skill: string, item: AlchemicalItemDataModel | WeaponDataModel): DiceRollSchema => {
        const mods = foundry.utils.deepClone(hero.modifiers)
        const isVicious = item instanceof WeaponDataModel ? item.properties.includes('vicious') : false
        const isDefense = item instanceof WeaponDataModel ? item.properties.includes('defense') : false
        const isThrown = item instanceof WeaponDataModel ? item.properties.includes('thrown') : false
        const versatileBonus = item instanceof WeaponDataModel ? ((item.grip.style === 'V' && item.grip.state === 'HH') ? 2 : 0) : 0

        if (item instanceof WeaponDataModel) {
            RelicPowerProcessor.applyRelicPowers(item.relicPowers as any, mods)
        }

        const dieSize =
            Math.max(mods.dice.size[skill]?.minimum ?? 0, item.damage.dice.faces) +
            versatileBonus +
            (mods.dice.size[skill]?.bonus ?? 0) +
            (isDefense ? mods.dice.size['defense']?.bonus : 0) +
            (isThrown ? mods.dice.size['thrown']?.bonus : 0)

        const explodesOnCrit = mods.dice.crit[skill]?.explodes
        const explodesOn = [
            ...item.damage.dice.explodesOn ?? [],
            ...mods.dice.exploding[skill]?.values ?? [],
            ...mods.dice.exploding[skill]?.max ? [dieSize] : [],
            ...explodesOnCrit ? [dieSize] : []
        ]

        const extraDiceOnCrit =
            (isVicious ? 1 : 0) +
            (mods.dice.crit[skill]?.extraDice ?? 0)

        const reroll = item instanceof WeaponDataModel ? mods.dice.reroll[skill]?.[item.grip.state] ?? [] : []

        return {
            count: item.damage.dice.count,
            faces: dieSize,
            modifier: item.damage.dice.modifier ?? 0,
            explodesOn: explodesOn ?? [],
            explodeOnCritOnly: explodesOnCrit ?? false,
            extraDiceOnCrit: extraDiceOnCrit ?? 0,
            reroll: reroll
        }
    }

}