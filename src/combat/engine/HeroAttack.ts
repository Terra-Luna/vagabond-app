import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { Attack } from "./Attack"
import { SkillCheckResult, SkillCheck } from "./SkillCheck"

export interface HeroAttackArgs {
    skill: string,
    critThreshold?: number,
    isFavored?: boolean,
    isHindered?: boolean,
    d20Count?: number,
    skillCheckMod?: number
}

export class HeroAttack extends Attack {
    override actor: Actor & { system: HeroDataModel }
    override targets: Token[] | undefined

    skill: string
    difficulty: number
    critThreshold: number
    isFavored: boolean
    isHindered: boolean
    d20Count: number
    skillCheckModifier: number
    skillCheck: SkillCheck | undefined
    skillCheckRoll: SkillCheckResult | undefined

    constructor(actor: Actor & { system: HeroDataModel }, args: HeroAttackArgs, targets?: Token[] | undefined) {
        super()
        this.actor = actor
        this.targets = targets
        const hero = actor.system
        const skillMods = hero.modifiers.skills[args.skill]
        this.skill = args.skill
        this.difficulty = hero.skills[args.skill]
        this.skillCheckModifier = args.skillCheckMod ?? skillMods.rollMod
        this.critThreshold = args.critThreshold ?? 20 + skillMods.critMod
        this.d20Count = args.d20Count ?? 1 + skillMods
        this.isFavored = args.isFavored ?? false
        this.isHindered = args.isHindered ?? false
        this.refreshSkillCheck()
    }

    public setFavored() {
        this.isFavored = true
        this.isHindered = false
    }

    public setHindered() {
        this.isHindered = true
        this.isFavored = false
    }

    public clearFavorHinder() {
        this.isHindered = false
        this.isFavored = false
    }

    public refreshSkillCheck() {
        if (this.skill) {
            const skillMods = this.actor.system.modifiers.skills[this.skill]
            this.skillCheck = new SkillCheck(
                this.actor.system,
                {
                    skill: this.skill,
                    d20Count: this.d20Count ?? 1 + skillMods.extraDice,
                    modifier: this.skillCheckModifier ?? skillMods.rollMod,
                    critThreshold: this.critThreshold ?? 20 + skillMods.critMod, //ActiveFx negative value is good
                    favorHinder: this.isFavored ? vgLiteLang.FavorHinder.favor : (
                        this.isHindered ? vgLiteLang.FavorHinder.hinder : vgLiteLang.FavorHinder.none
                    )
                }
            )
        }
    }

    public async rollSkillCheck(): Promise<SkillCheckResult | undefined> {
        if (this.skillCheck) {
            const roll = await this.skillCheck.roll()
            this.skillCheckRoll = roll
            return roll
        }
        else {
            return undefined
        }
    }

    public async addLateD6toSkillCheck(): Promise<SkillCheckResult | undefined> {
        if (this.skillCheckRoll && this.skillCheckRoll.d6 === 0) {
            const result = { ...this.skillCheckRoll }
            const d6 = await new Roll("1d6").evaluate()
            result.d6 = d6.total
            result.rolls.push(d6)
            if (result.total + result.d6 >= this.difficulty) {
                result.outcome = vgLiteLang.RollResult.success
            }
            this.skillCheckRoll = result
            return this.skillCheckRoll
        }
        else {
            ui.notifications?.warn("A D6 has already been applied to this Skill Check!")
            return undefined
        }
    }

    public getSkillCheckChatArgs(): SkillCheckResult & { skillName: string } | undefined {
        if (this.skillCheckRoll && this.skill) {
            return { ...this.skillCheckRoll, skillName: vgLiteLang.Skills[this.skill].name }
        }
        else {
            return undefined
        }
    }

}