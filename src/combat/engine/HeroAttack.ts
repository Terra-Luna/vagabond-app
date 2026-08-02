import { createElement } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { sendVgLiteChatMessage } from "../../view/chat/ChatCardSerializer"
import { Attack } from "./Attack"
import { SkillCheck } from "./SkillCheck"
import { InteractiveAttackChatCard } from "../ui/InteractiveAttackChatCard"
import { serializeAttack } from "./util/attack-serializer"
import { SpellDeliverySnapshot } from "../spellcasting/SpellDelivery"
import { roll3dDice } from "../../utils/foundryUtils"
import { getDiceTerms } from "./util/dice-utils"

export class HeroAttack extends Attack {
    override actor: Actor & { system: HeroDataModel }
    override targetIds?: string[]

    sourceId: string = ''
    skipSkillCheck: boolean = false
    skill: string | undefined
    difficulty: number = 20
    critThreshold: number = 20
    isFavored: boolean = false
    isHindered: boolean = false
    d20Count: number = 1
    spellDelivery: SpellDeliverySnapshot | undefined
    skillCheckModifier: number = 0
    skillCheck?: SkillCheck
    critChoice?: 'luck' | 'damage' | 'spellFx'
    isRerolled: boolean = false

    constructor(title: string, actor: Actor & { system: HeroDataModel }, targetIds?: string[]) {
        super(title)
        this.actor = actor
        this.targetIds = targetIds ? [...targetIds] : []
        this.refreshSkillCheck()
    }

    private get isSuccessOrCrit(): boolean {
        return this.skillCheck?.result?.outcome !== vgLiteLang.RollResult.failure
    }

    private get isEligibleForDmgRoll(): boolean {
        return this.hasHostileTargets || this.damageRoll?.dmgType === 'healing'
    }

    get hasHostileTargets(): boolean {
        return this.targetIds?.some(id => canvas?.scene?.tokens.get(id)?.disposition === -1) ?? false
    }

    get showSkillCheck(): boolean {
        return !!this.skillCheck?.result?.outcome && !this.skipSkillCheck
    }

    get showCritChoices(): boolean {
        const hasPermission = game.user?.isGM || game.user?.id === this.userId
        return hasPermission && this.skillCheck?.result?.outcome === vgLiteLang.RollResult.crit && !this.critChoice
    }

    get isEffectOnlySpellAttack(): boolean {
        return this.spellDelivery?.applyEffect ?? false
    }

    /**
     * Show damage rolls section when there was either a successful
     * damaging or effect-only attack OR if the PC has only targeted
     * friendly players with healing and/or an effect. Additionally,
     * some cases (Imbue delivery) may skip the skill check altogether.
     */
    override get showDamage(): boolean {
        const isSuccess = this.skipSkillCheck || this.isSuccessOrCrit
        const isDmgOrEffect = super.showDamage || this.isEffectOnlySpellAttack
        return (isSuccess && isDmgOrEffect) || (!this.hasHostileTargets && isDmgOrEffect)
    }

    async initiate() {
        this.refreshSkillCheck()

        if (this.hasHostileTargets && !this.skipSkillCheck) {
            await this.rollSkillCheck()
        }

        if (this.skipSkillCheck || this.isSuccessOrCrit && this.isEligibleForDmgRoll) {
            await this.rollDamage()
        }

        await this.save(serializeAttack)
        this.sendChatMessage()
    }

    private sendChatMessage() {
        sendVgLiteChatMessage(
            this.actor,
            createElement(InteractiveAttackChatCard, { actorId: this.actor.id!, attackId: this.id }),
            [...this.skillCheck?.result?.rolls ?? []]
        )
    }

    setFavored() {
        this.isFavored = true
        this.isHindered = false
    }

    setHindered() {
        this.isHindered = true
        this.isFavored = false
    }

    clearFavorHinder() {
        this.isHindered = false
        this.isFavored = false
    }

    refreshSkillCheck() {
        if (this.skill) {
            const skillMods = this.actor.system.modifiers.skills[this.skill]
            this.skillCheck = new SkillCheck(
                this.actor.system,
                {
                    skill: this.skill,
                    d20Count: this.d20Count ?? (1 + skillMods.extraDice),
                    modifier: this.skillCheckModifier ?? skillMods.rollMod,
                    critThreshold: this.critThreshold ?? (20 + skillMods.critMod), //Negative value is good
                    favorHinder: this.isFavored ? vgLiteLang.FavorHinder.favor : (
                        this.isHindered ? vgLiteLang.FavorHinder.hinder : vgLiteLang.FavorHinder.none
                    )
                }
            )
        }
    }

    async rollSkillCheck(isReroll: boolean = false) {
        if (!this.skillCheck) {
            this.refreshSkillCheck()
        }

        this.isRerolled = isReroll
        await this.skillCheck?.roll()

        if (isReroll) {
            const luck = this.actor.system.statuses.counters.luck
            await this.actor.update(
                { 'system.statuses.counters.luck': luck - 1 } as Record<string, number>,
                { ['skipTrackerChatCard' as string]: true }
            )

            roll3dDice([this.skillCheck?.result?.rolls[0]])

            if (this.skillCheck?.result && this.skillCheck?.result.outcome !== vgLiteLang.RollResult.failure) {
                if (this.isEligibleForDmgRoll) {
                    await this.rollDamage()
                }
            }
            else {
                this.isResolved = true
            }
        }

        await this.save(serializeAttack)
    }

    /**
     * Inserts a D6 roll into the results and adds it to the total.
     * @returns 
     */
    async addLateFavor(resource: 'luck' | 'studied', currentValue: number) {
        if (this.skillCheck && this.skillCheck.result) {
            await this.actor.update(
                { [`system.statuses.counters.${resource}`]: currentValue - 1 },
                { ['skipTrackerChatCard' as string]: true }
            )

            const result = this.skillCheck.result
            const newResult = { ...result }

            if (this.skillCheck.result.d6 === 0) {
                const d6 = await new Roll("1d6").evaluate()
                newResult.d6 = d6.total
                newResult.total += d6.total
                newResult.rolls.push(d6)
                newResult.favorHinder = vgLiteLang.FavorHinder.favor

                if (newResult.total >= result.difficulty) {
                    newResult.outcome = vgLiteLang.RollResult.success
                }

                this.skillCheck.result = newResult
                this.setFavored()

                roll3dDice([d6])

                if (newResult.outcome !== vgLiteLang.RollResult.failure) {
                    await this.rollDamage()
                }
                else {
                    this.isResolved = true
                }
            }
            else {
                this.removeHinderFromSkillCheck()
            }

            await this.save(serializeAttack)
            return result
        }
        else {
            ui.notifications?.warn("D6 already applied to Skill Check")
            return undefined
        }
    }

    /**
     * Inserts a D6 roll into the results and subtracts it to the total.
     * @returns 
     */
    async addLateHinder() {
        if (this.skillCheck && this.skillCheck.result && this.skillCheck.result.d6 === 0) {
            const result = this.skillCheck.result
            const newResult = { ...result }
            const d6 = await new Roll("1d6").evaluate()
            newResult.d6 = d6.total
            newResult.total -= d6.total
            newResult.rolls.push(d6)
            newResult.favorHinder = vgLiteLang.FavorHinder.hinder

            if (newResult.total >= result.difficulty) {
                newResult.outcome = vgLiteLang.RollResult.success
            }
            else {
                newResult.outcome = vgLiteLang.RollResult.failure
                this.isResolved = true
            }

            this.skillCheck.result = newResult
            this.setHindered()
            await this.save(serializeAttack)

            roll3dDice([d6])

            return result
        }
        else {
            ui.notifications?.warn("D6 already applied to Skill Check")
            return undefined
        }
    }

    async removeHinderFromSkillCheck() {
        if (this.isHindered && this.skillCheck && this.skillCheck.result && this.skillCheck.result.d6 > 0) {
            const result = this.skillCheck.result
            const newResult = { ...result }
            newResult.total += newResult.d6
            newResult.d6 = 0
            newResult.favorHinder = vgLiteLang.FavorHinder.none
            newResult.rolls = newResult.rolls.filter(r => getDiceTerms(r).flatMap(t => t.faces).includes(20))

            if (newResult.total >= result.difficulty) {
                newResult.outcome = vgLiteLang.RollResult.success
            }
            else {
                this.isResolved = true
            }

            this.clearFavorHinder()
            this.skillCheck.favorHinder = vgLiteLang.FavorHinder.none
            this.skillCheck.result = newResult
            await this.save(serializeAttack)

            return result
        }
    }

    async addCritLuck() {
        this.critChoice = 'luck'
        const luck = this.actor.system.statuses.counters.luck
        await this.actor.update({ 'system.statuses.counters.luck': luck + 1 } as Record<string, number>)
        await this.save(serializeAttack)
    }

    async addCritDamage() {
        if (this.skill && this.damageRoll?.result) {
            this.critChoice = 'damage'
            const skill = this.actor.system.skills[this.skill]
            const critDmg = skill.isTrained
                ? (20 - skill.value) / 2
                : 20 - skill.value
            this.damageRoll.result.bonus += critDmg
            this.damageRoll.result.total += critDmg
            await this.save(serializeAttack)
        }
    }

    async addCritSpellFx() {
        this.critChoice = 'spellFx'
        await this.save(serializeAttack)
    }

}