import { createElement } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { vgLiteLang } from "../../utils/lang"
import { sendVgLiteChatMessage } from "../../view/chat/ChatCardSerializer"
import { Attack } from "./Attack"
import { SkillCheckResult, SkillCheck } from "./SkillCheck"
import { InteractiveAttackChatCard } from "../ui/InteractiveAttackChatCard"
import { serializeAttack } from "./util/attack-serializer"
import { SpellDeliverySnapshot } from "../spellcasting/SpellDelivery"

export class HeroAttack extends Attack {
    override actor: Actor & { system: HeroDataModel }
    override targetIds?: string[]

    sourceId: string = ''
    skill: string | undefined
    difficulty: number = 20
    critThreshold: number = 20
    isFavored: boolean = false
    isHindered: boolean = false
    d20Count: number = 1
    spellDelivery: SpellDeliverySnapshot | undefined
    skillCheckModifier: number = 0
    skillCheck?: SkillCheck
    skillCheckResult?: SkillCheckResult
    isRerolled: boolean = false

    steps = ['config', 'skill_check', 'damage_roll', 'resolve', 'complete']

    constructor(title: string, actor: Actor & { system: HeroDataModel }, targetIds?: string[]) {
        super(title)
        this.actor = actor
        this.targetIds = targetIds ? [...targetIds] : []
        this.refreshSkillCheck()
    }

    override async next() {
        this.stepIndex += 1
        const step = this.steps[this.stepIndex]

        if (step === 'skill_check') {
            this.refreshSkillCheck()

            if (this.hasHostileTargets()) {
                await this.rollSkillCheck()
            }

            await this.saveToActor(serializeAttack)

            sendVgLiteChatMessage(
                this.actor,
                createElement(InteractiveAttackChatCard, { actorId: this.actor.id!, attackId: this.id }),
                [...this.skillCheckResult?.rolls ?? []]
            )

            this.next()
        }
        else if (step === 'damage_roll') {
            if (this.hasHostileTargets() || this.damageRoll?.dmgType === 'healing') {
                await this.rollDamage(serializeAttack)
            }
            else {
                this.next()
            }
        }
        else if (step === 'resolve') {
            this.isResolved = true
            this.processDamageRoll()
            await this.saveToActor(serializeAttack)
        }
    }

    hasHostileTargets(): boolean {
        return this.targetIds?.some(id => canvas?.scene?.tokens.get(id)?.disposition === -1) ?? false
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
        this.skillCheckResult = await this.skillCheck?.roll()
        this.saveToActor(serializeAttack)

        if (isReroll) {
            // Trigger a 3D dice roll without a chat message.
            if ((game as any).dice3d) {
                await (game as any).dice3d.showForRoll(this.skillCheckResult?.rolls[0], game.user, true)
            }
        }

        if (this.skillCheckResult?.outcome !== vgLiteLang.RollResult.failure && this.damageRollResult) {
            this.trigger3dDamageRoll()
        }
    }

    /**
     * Inserts a D6 roll into the results and updates the total.
     * It adds 
     * @returns 
     */
    async addLateD6() {
        const result = this.skillCheckResult
        if (result && result.d6 === 0) {
            const newResult = { ...result }
            const d6 = await new Roll("1d6").evaluate()
            newResult.d6 = d6.total
            newResult.total += d6.total
            newResult.rolls.push(d6)
            newResult.favorHinder = vgLiteLang.FavorHinder.favor
            if (newResult.total + newResult.d6 >= result.difficulty) {
                newResult.outcome = vgLiteLang.RollResult.success
            }

            this.skillCheckResult = newResult
            this.setFavored()
            this.saveToActor(serializeAttack)

            // Trigger a 3D dice roll without a chat message.
            if ((game as any).dice3d) {
                await (game as any).dice3d.showForRoll(d6, game.user, true)
            }

            return result
        }
        else {
            ui.notifications?.warn("A D6 has already been applied to this Skill Check!")
            return undefined
        }
    }

    async addLateHinder() {
        const result = this.skillCheckResult
        if (result && result.d6 === 0) {
            const newResult = { ...result }
            const d6 = await new Roll("1d6").evaluate()
            newResult.d6 = d6.total
            newResult.total -= d6.total
            newResult.rolls.push(d6)
            newResult.favorHinder = vgLiteLang.FavorHinder.hinder
            if (newResult.total + newResult.d6 >= result.difficulty) {
                newResult.outcome = vgLiteLang.RollResult.success
            }
            else {
                newResult.outcome = vgLiteLang.RollResult.failure
            }

            this.skillCheckResult = newResult
            this.setHindered()
            this.saveToActor(serializeAttack)

            // Trigger a 3D dice roll without a chat message.
            if ((game as any).dice3d) {
                await (game as any).dice3d.showForRoll(d6, game.user, true)
            }

            return result
        }
        else {
            ui.notifications?.warn("A D6 has already been applied to this Skill Check!")
            return undefined
        }
    }

    async removeHinderFromSkillCheck() {
        const result = this.skillCheckResult
        if (result && result.d6 > 0) {
            const newResult = { ...result }
            newResult.total += newResult.d6
            newResult.d6 = 0
            newResult.favorHinder = vgLiteLang.FavorHinder.none
            if (newResult.total + newResult.d6 >= result.difficulty) {
                newResult.outcome = vgLiteLang.RollResult.success
            }

            this.skillCheckResult = newResult
            this.clearFavorHinder()
            this.saveToActor(serializeAttack)

            return result
        }
    }


}