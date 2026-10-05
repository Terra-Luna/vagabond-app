import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

import { DiceRollSchema } from "../../../apps/attack-builder/model/DieRollSchema"
import { RelicPowerProcessor } from "../../../apps/vagabond-tools/relic/RelicPowerProcessor"
import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import type { AlchemicalItemDataModel } from "../../../model/item/equip/AlchemicalItemDataModel"
import type { WeaponDataModel } from "../../../model/item/equip/WeaponDataModel"
import { appLang } from "../../../utils/lang"
import { getDiceTerms, rollExplosions } from "../util/dice-utils"
import { DiceRoll } from "./DiceRoll"

export type SkillCheckType = 'attack' | 'cast' | 'save' | 'check'

export interface SkillCheckArgs {
    type: SkillCheckType
    item?: AlchemicalItemDataModel | WeaponDataModel
    skill: string
    d20Count?: number
    bonusDice?: DiceRollSchema[]
    modifier?: number
    critThreshold?: number
    critSum?: boolean
    explodeFavor?: boolean
    favorHinder?: 'favor' | 'hinder' | 'none'
    clickEvent?: React.MouseEvent<HTMLDivElement>
}

export interface SkillCheckResult {
    skill: string
    skillName: string
    difficulty: number
    critThreshold: number
    d20Count: number
    bonusDice?: { faces: number, result: number }[]
    modifier: number
    favorHinder: string
    d20s: number[]
    d6s: number[]
    total: number
    outcome: string
    rolls: Roll.Evaluated<Roll<EmptyObject>>[]
}

export class SkillCheck {
    type: SkillCheckType
    skill: string
    difficulty: number
    d20Count: number
    bonusDice?: DiceRoll[]
    modifier: number
    critThreshold: number
    critSum: boolean
    explodeFavor: boolean
    favorHinder: 'favor' | 'hinder' | 'none'
    clickEvent?: React.MouseEvent<HTMLDivElement> | undefined
    result: SkillCheckResult | undefined

    constructor(hero: HeroDataModel, args: SkillCheckArgs) {
        const heroMods = foundry.utils.deepClone(hero.modifiers)

        if (args.item) {
            RelicPowerProcessor.applyRelicPowers(args.item.relicPowers as any, heroMods)
        }

        const skillMods = heroMods.skillCheck[args.skill]

        const globalMods = args.type === 'attack'
            ? foundry.utils.deepClone(hero.modifiers).skillCheck.attack
            : (args.type === 'cast'
                ? foundry.utils.deepClone(hero.modifiers).skillCheck.cast
                : undefined
            )

        let bonusRolls = args.bonusDice?.map(d => new DiceRoll(d)) ?? []

        // Keep the highest bonus die if multiple are present, otherwise use the one specified in the skill modifier args.
        if (bonusRolls.length === 0) {
            if (skillMods?.d4) bonusRolls = [new DiceRoll({ count: 1, faces: 4 })]
            if (skillMods?.d6) bonusRolls = [new DiceRoll({ count: 1, faces: 6 })]
            if (skillMods?.d8) bonusRolls = [new DiceRoll({ count: 1, faces: 8 })]
        }

        this.type = args.type
        this.skill = args.skill
        this.difficulty = hero.skills[args.skill]?.value ?? hero.saves[args.skill]
        this.d20Count = args.d20Count ?? (1 + (skillMods?.extraDice ?? 0) + (globalMods?.extraDice ?? 0))
        this.bonusDice = bonusRolls
        this.modifier = args.modifier ?? ((skillMods?.modifier ?? 0) + (globalMods?.modifier ?? 0))
        this.critThreshold = args.critThreshold ?? (20 - ((skillMods?.critThreshold ?? 0) + (globalMods?.critThreshold ?? 0)))
        this.critSum = args.critSum ?? false
        this.explodeFavor = args.explodeFavor ?? false
        this.favorHinder = this.getFavorHinderFromHotkey(args.clickEvent) ?? args.favorHinder ?? 'none'
        this.clickEvent = args.clickEvent
    }

    toJson() {
        return {
            skill: this.skill,
            difficulty: this.difficulty,
            d20Count: this.d20Count,
            bonusDice: this.bonusDice?.map(d => ({ count: d.count, faces: d.faces })),
            modifier: this.modifier,
            critThreshold: this.critThreshold,
            favorHinder: this.favorHinder,
            result: this.result
        }
    }

    static fromJson(actor, snapshot): SkillCheck | undefined {
        if (!snapshot) return undefined
        try {
            const skillCheck = new SkillCheck(actor.system, {
                type: snapshot.type,
                skill: snapshot.skill,
                d20Count: snapshot.d20Count,
                bonusDice: snapshot.bonusDice?.map(d => ({ count: 1, faces: d.faces })),
                modifier: snapshot.modifier,
                critThreshold: snapshot.critThreshold,
                favorHinder: snapshot.favorHinder
            })
            skillCheck.result = snapshot.result
            return skillCheck
        }
        catch (error) {
            console.error(error)
            return undefined
        }
    }

    public async roll(isReroll: boolean = false): Promise<SkillCheckResult> {
        let favorHinder = this.favorHinder
        const existingD6s = this.result?.d6s ?? []
        const existingD6 = existingD6s.reduce((a, b) => a + b, 0)

        /**
         * Override favorHinder with shift/ctrl key hold.
         */
        if (this.clickEvent?.shiftKey) {
            favorHinder = 'favor'
        }
        else if (this.clickEvent?.ctrlKey) {
            favorHinder = 'hinder'
        }
    
        /**
         * Build roll formula and evaluate.
         * "kh" = "keep highest"
         */
        let formula = `${this.d20Count ?? 1}d20kh`

        if (this.modifier) {
            formula += `+${this.modifier}`
        }

        if (!isReroll) {
            if (favorHinder === 'favor') {
                formula += '+1d6'
            }
            else if (favorHinder === 'hinder') {
                formula += '-1d6'
            }
        }

        const roll = await new Roll(formula).evaluate()

        const bonusRolls: any[] = []
        if (this.bonusDice?.length) {
            for (const bonusDie of this.bonusDice) {
                bonusRolls.push(await new Roll(bonusDie.toRollFormula()).evaluate())
            }
        }

        /**
         * Extract roll results...
         */
        const terms = getDiceTerms(roll)
        const d20Term = terms.find(it => it.faces === 20)
        const d6Term = terms.find(it => it.faces === 6)
        const d6Initial = d6Term?.results?.find(r => r.active)?.result ?? 0

        /**
         * A favor d6 may explode on 6s, with all results summed into the d6 value.
         */
        const favorExplosions = (this.explodeFavor && !isReroll && favorHinder === 'favor' && d6Term)
            ? await rollExplosions([d6Term], [6])
            : []
        const favorExplosionTotal = favorExplosions.reduce((acc, r) => acc + r.total, 0)
        const d6Res = d6Initial + favorExplosionTotal
        const d20Res = d20Term?.results?.map(r => r.result)?.sort((a, b) => a - b) ?? [0]
        const bonusTerms = bonusRolls.flatMap(b => getDiceTerms(b))
        const rerolledD6Bonus = isReroll
            ? (favorHinder === 'favor' ? existingD6 ?? 0 : favorHinder === 'hinder' ? -(existingD6 ?? 0) : 0)
            : 0
        const total = roll.total + favorExplosionTotal + rerolledD6Bonus + bonusTerms.reduce((acc, term) => acc + term.results.reduce((sum, r) => sum + r.result, 0), 0)
        const isSuccess = total >= this.difficulty
        const isCrit = d20Res.some(res => res >= this.critThreshold) || (this.critSum && ([...d20Res]?.sort((a, b) => b - a)?.pop() ?? 0) + d6Res >= this.critThreshold)

        this.result = {
            skill: this.skill,
            skillName: appLang.Skills[this.skill]?.name ?? appLang.Saves[this.skill]?.name ?? '',
            difficulty: this.difficulty,
            modifier: this.modifier,
            critThreshold: this.critThreshold,
            d20Count: this.d20Count,
            favorHinder: this.favorHinder,
            d20s: d20Res,
            bonusDice: bonusTerms.map(term => ({ faces: term.faces ?? 0, result: term.results?.reduce((sum, r) => sum + r.result, 0) ?? 0 })),
            d6s: isReroll
                ? existingD6s
                : (d6Term ? [d6Initial, ...favorExplosions.flatMap(r => getDiceTerms(r)).flatMap(t => t.results.map(x => x.result))] : []),
            total: total,
            outcome: isCrit ? appLang.RollResult.crit : (isSuccess ? appLang.RollResult.success : appLang.RollResult.failure),
            rolls: [roll, ...favorExplosions, ...bonusRolls]
        }

        return this.result
    }

    get isFavored() { return this.favorHinder === 'favor' }
    get isHindered() { return this.favorHinder === 'hinder' }

    setFavorHinder(e?: React.MouseEvent<HTMLDivElement>) {
        this.clickEvent = e
        this.favorHinder = this.getFavorHinderFromHotkey(e) ?? 'none'
    }

    private getFavorHinderFromHotkey(e?: React.MouseEvent<HTMLDivElement>): 'favor' | 'hinder' | undefined {
        if (e?.shiftKey) {
            return 'favor'
        }
        else if (e?.ctrlKey) {
            return 'hinder'
        }
    }

}