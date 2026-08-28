import { EmptyObject } from "@league-of-foundry-developers/foundry-vtt-types/utils"

import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../../utils/lang"
import { getDiceTerms } from "../util/dice-utils"

export type SkillCheckType = 'attack' | 'cast' | 'save' | 'check'

export interface SkillCheckArgs {
    type: SkillCheckType
    skill: string
    d20Count?: number
    blockDie?: number
    modifier?: number
    critThreshold?: number
    favorHinder?: 'favor' | 'hinder' | 'none'
    clickEvent?: React.MouseEvent<HTMLDivElement>
}

export interface SkillCheckResult {
    skill: string
    blockDie: number
    skillName: string
    difficulty: number
    critThreshold: number
    d20Count: number
    modifier: number
    favorHinder: string
    d20s: number[]
    d6: number
    total: number
    outcome: string
    rolls: Roll.Evaluated<Roll<EmptyObject>>[]
}

export class SkillCheck {
    type: SkillCheckType
    skill: string
    difficulty: number
    blockDie: number
    d20Count: number
    modifier: number
    critThreshold: number
    favorHinder: 'favor' | 'hinder' | 'none'
    clickEvent?: React.MouseEvent<HTMLDivElement> | undefined
    result: SkillCheckResult | undefined

    constructor(hero: HeroDataModel, args: SkillCheckArgs) {
        const skillMods = args.blockDie ? undefined : hero.modifiers.skillCheck[args.skill]

        const globalMods = args.type === 'attack'
            ? hero.modifiers.skillCheck.attack
            : (args.type === 'cast'
                ? hero.modifiers.skillCheck.cast
                : undefined
            )

        this.type = args.type
        this.skill = args.skill
        this.blockDie = args.blockDie ?? 0
        this.difficulty = hero.skills[args.skill]?.value ?? hero.saves[args.skill]
        this.d20Count = args.d20Count ?? (1 + (skillMods?.extraDice ?? 0) + (globalMods?.extraDice ?? 0))
        this.modifier = args.modifier ?? ((skillMods?.modifier ?? 0) + (globalMods?.modifier ?? 0))
        this.critThreshold = args.critThreshold ?? (20 - ((skillMods?.critThreshold ?? 0) + (globalMods?.critThreshold ?? 0)))
        this.favorHinder = args.favorHinder ?? this.getFavorHinderFromHotkey(args.clickEvent)
        this.clickEvent = args.clickEvent
    }

    toJson() {
        return {
            skill: this.skill,
            blockDie: this.blockDie,
            difficulty: this.difficulty,
            d20Count: this.d20Count,
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
                blockDie: snapshot.blockDie,
                d20Count: snapshot.d20Count,
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
        const existingD6 = this.result?.d6

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
        let formula = this.blockDie > 0 ? `d${this.blockDie}` : `${this.d20Count ?? 1}d20kh`

        if (this.blockDie === 0) {
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
        }

        const roll = await new Roll(formula).evaluate()
    
        /**
         * Extract roll results...
         */
        const isSuccess = roll.total >= this.difficulty
        const terms = getDiceTerms(roll)
        const d20Term = terms.find(it => it.faces === (this.blockDie > 0 ? this.blockDie : 20))
        const d6Term = terms.find(it => it.faces === 6)
        const d20Res = d20Term?.results?.map(r => r.result)?.sort((a, b) => a - b) ?? [0]
        const d6Res = d6Term?.results?.find(r => r.active)?.result ?? 0
        const isCrit = d20Res.some(res => res >= this.critThreshold)

        this.result =  {
            skill: this.skill,
            blockDie: this.blockDie,
            skillName: vgLiteLang.Skills[this.skill]?.name ?? vgLiteLang.Saves[this.skill]?.name ?? '',
            difficulty: this.difficulty,
            modifier: this.modifier,
            critThreshold: this.critThreshold,
            d20Count: this.d20Count,
            favorHinder: this.favorHinder,
            d20s: d20Res,
            d6: isReroll ? existingD6 ?? 0 : d6Res,
            total: roll.total,
            outcome: isCrit ? vgLiteLang.RollResult.crit : (isSuccess ? vgLiteLang.RollResult.success : vgLiteLang.RollResult.failure),
            rolls: [roll]
        }

        return this.result
    }

    get isFavored() { return this.favorHinder === 'favor' }
    get isHindered() { return this.favorHinder === 'hinder' }

    setFavorHinder(e?: React.MouseEvent<HTMLDivElement>) {
        this.clickEvent = e
        this.favorHinder = this.getFavorHinderFromHotkey(e)
    }

    private getFavorHinderFromHotkey(e?: React.MouseEvent<HTMLDivElement>): 'favor' | 'hinder' | 'none' {
        if (e?.shiftKey) {
            return 'favor'
        }
        else if (e?.ctrlKey) {
            return 'hinder'
        }
        else {
            return 'none'
        }
    }

}