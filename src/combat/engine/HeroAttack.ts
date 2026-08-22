import { createElement } from "react"

import { RollPreset } from "../../apps/attack-builder/model/RollPreset"
import { getManaEnforcement } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { roll3dDice } from "../../utils/foundryUtils"
import { vgLiteLang } from "../../utils/lang"
import { getTargetIds } from "../../utils/modelUtil"
import { sendVagabondChatMessage } from "../../view/chat/ChatCardSerializer"
import { SkillCheckChatCard } from "../../view/chat/SkillCheckChatCard"
import { Imbue, SpellDelivery, SpellDeliverySnapshot } from "../spellcasting/SpellDelivery"
import { InteractiveAttackChatCard } from "../ui/InteractiveAttackChatCard"
import { Attack } from "./Attack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import { SkillCheck, SkillCheckType } from "./roll/SkillCheck"
import { serializeAttack } from "./util/attack-serializer"
import { getDiceTerms } from "./util/dice-utils"

export class HeroAttack extends Attack {

    static SPELL_DIE_SIZE = 6
    override readonly attackType = 'hero' as const

    override actor: Actor & { system: HeroDataModel }
    override targetIds?: string[]
    itemId: string = ''
    skipSkillCheck: boolean = false
    spellDelivery: SpellDeliverySnapshot | undefined
    skillCheck?: SkillCheck
    critChoice?: 'luck' | 'damage' | 'spellFx'
    isRerolled: boolean = false

    constructor(
        title: string,
        actor: Actor & { system: HeroDataModel },
        targetIds?: string[],
        skillCheck?: SkillCheck,
        damageRoll?: DamageRoll
    ) {
        super(title)
        this.actor = actor
        this.targetIds = targetIds ? [...targetIds] : []
        this.skillCheck = skillCheck
        this.damageRoll = damageRoll
    }

    private get isSuccessOrCrit(): boolean {
        return this.skillCheck?.result?.outcome !== vgLiteLang.RollResult.failure
    }

    private get isCrit(): boolean {
        return this.skillCheck?.result?.outcome === vgLiteLang.RollResult.crit
    }

    private get isEligibleForDmgRoll(): boolean {
        if (!this.damageRoll || !this.damageRoll.dice) return false
        const dice = this.damageRoll.dice.flatMap(d => d.count)
        const damageDiceCount = dice.reduce((sum, d) => { return sum + d }, 0)
        return damageDiceCount > 0
    }

    get hasHostileTargets(): boolean {
        if (!this.targetIds || this.targetIds.length === 0) return false
        return this.targetIds.some(id => canvas?.scene?.tokens.get(id)?.disposition === -1) ?? false
    }

    get showSkillCheck(): boolean {
        return !!this.skillCheck?.result?.outcome && !this.skipSkillCheck
    }

    get showCritChoices(): boolean {
        if (!this.isCrit) return false
        const hasPermission = game.user?.isGM || game.user?.id === this.userId
        return hasPermission && !this.critChoice
    }

    get isSpellAttack(): boolean {
        return !!this.spellDelivery
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

    async initiate(clickEvent?: any) {
        this.id = foundry.utils.randomID()
        if (this.skillCheck && this.hasHostileTargets && !this.skipSkillCheck) {
            this.skillCheck.setFavorHinder(clickEvent)
            await this.rollSkillCheck()
        }

        if (this.isEligibleForDmgRoll && this.isSuccessOrCrit) {
            await this.rollDamage(this.skillCheck?.result?.outcome === vgLiteLang.RollResult.crit)
        }

        await this.save(serializeAttack)
        this.sendChatMessage()
    }

    private sendChatMessage() {
        sendVagabondChatMessage(
            this.actor,
            createElement(InteractiveAttackChatCard, { actorId: this.actor.id!, attackId: this.id }),
            [...this.skillCheck?.result?.rolls ?? []]
        )
    }

    setFavored() {
        if (this.skillCheck) {
            this.skillCheck.favorHinder = 'favor'
        }
    }

    setHindered() {
        if (this.skillCheck) {
            this.skillCheck.favorHinder = 'hinder'
        }
    }

    clearFavorHinder() {
        if (this.skillCheck) {
            this.skillCheck.favorHinder = 'none'
        }
    }

    async rollSkillCheck(isReroll: boolean = false) {
        if (!this.skillCheck) return

        this.isRerolled = isReroll
        await this.skillCheck?.roll(isReroll)

        if (isReroll) {
            const luck = this.actor.system.statuses.counters.luck
            await this.actor.update(
                { 'system.statuses.counters.luck': luck - 1 } as Record<string, number>,
                { ['skipTrackerChatCard' as string]: true }
            )

            roll3dDice([this.skillCheck?.result?.rolls[0]])

            if (this.skillCheck?.result &&
                this.skillCheck?.result.outcome !== vgLiteLang.RollResult.failure &&
                this.isEligibleForDmgRoll
            ) {
                await this.rollDamage()
                await this.save(serializeAttack)
            }
            else {
                this.isResolved = true
                await this.save(serializeAttack)
            }
        }
    }

    /**
     * Inserts a D6 roll into the results and adds it to the total.
     * @returns 
     */
    async addLateFavor(resource: 'luck' | 'studied', currentValue: number) {
        if (this.skillCheck?.isFavored ?? false) {
            ui.notifications?.info("Cannot add Favor to Favored attack")
            return
        }

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
                    await this.damageRoll?.roll()
                    roll3dDice(this.damageRoll?.result?.rolls ?? [])
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
        if (this.skillCheck && this.skillCheck.isHindered && this.skillCheck.result && this.skillCheck.result.d6 > 0) {
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
            this.skillCheck.favorHinder = 'none'
            this.skillCheck.result = newResult
            await this.save(serializeAttack)

            return result
        }
    }

    async addCritLuck() {
        this.critChoice = 'luck'
        const luck = this.actor.system.statuses.counters.luck
        await this.actor.update(
            { 'system.statuses.counters.luck': luck + 1 } as Record<string, number>,
            { ['skipTrackerChatCard' as string]: true }
        )
        await this.save(serializeAttack)
    }

    async addCritDamage() {
        if (!this.skillCheck) return

        if (this.skillCheck.skill && this.damageRoll?.result) {
            this.critChoice = 'damage'
            const skill = this.actor.system.skills[this.skillCheck.skill]
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

    static buildWeaponAttack(
        actor: Actor & { system: HeroDataModel },
        item: Item & { system: WeaponDataModel },
        skill?: string,
        extraDice?: DiceRoll[]
    ): HeroAttack {
        const hero = actor.system
        const weapon = item.system
        const isKeen = weapon.properties.includes('keen')
        const dmgMods = hero.modifiers.damage

        let weaponSkill = skill

        // If a skill wasn't provided for the skill check, use the highest applicable skill.
        if (!weaponSkill) {
            const defaultSkill = HeroAttack.getHighestDefaultWeaponSkill(hero, weapon)
            weaponSkill = defaultSkill?.skill ?? 'melee'
        }

        const skillCheck = new SkillCheck(hero, {
            type: 'attack',
            skill: weaponSkill!
        })

        skillCheck.critThreshold -= (isKeen ? 1 : 0)

        const damageDice = new DiceRoll(
            DiceRoll.getWeaponDamageWithHeroMods(hero, weaponSkill, weapon)
        )

        const damageRoll = new DamageRoll({
            atkName: item.name,
            dmgType: weapon.damage.type,
            dice: [damageDice, ...extraDice ?? []],
            flatDmgBonus: (dmgMods.out.all ?? 0) + (dmgMods.out.attack ?? 0),
            perDieDmgBonus: (dmgMods.out.allPerDie ?? 0) + (dmgMods.out.attackPerDie ?? 0),
        })

        const attack = new HeroAttack(item.name, actor, getTargetIds(), skillCheck, damageRoll)
        attack.itemId = item.uuid

        return attack
    }

    static buildSpellAttack(
        actor: Actor & { system: HeroDataModel },
        skill: string,
        delivery: SpellDelivery,
        clickEvent?: any
    ): HeroAttack | null {
        const hero = actor.system

        if (getManaEnforcement() && (
            delivery.manaCost > hero.mana.current || delivery.manaCost > hero.mana.maxCast
        )) { return null }

        const updates: any = {}
        if (delivery.manaCost > 0) {
            updates['system.mana.current'] = Math.max(0, hero.mana.current - delivery.manaCost)
        }

        if (delivery.studyDamageDice > 0) {
            updates['system.statuses.counters.studied'] = Math.max(0, hero.statuses.counters.studied - delivery.studyDamageDice)
        }

        if (updates) {
            actor.update(updates)
        }

        const skillCheck = new SkillCheck(hero, { type: 'cast', skill: skill, clickEvent: clickEvent })

        let damageRoll: DamageRoll | undefined = undefined

        if (delivery.damageDice > 0 && delivery.spell.damageType !== 'none') {
            const isHealing = delivery.spell.damageType === 'healing'

            const dieSizeMod = isHealing
                ? hero.modifiers.dice.size.spellHealing.bonus ?? 0
                : hero.modifiers.dice.size.spell.bonus ?? 0

            const explosionsMod = isHealing
                ? hero.modifiers.dice.exploding.spellHealing.values
                : hero.modifiers.dice.exploding.spell.values

            damageRoll = new DamageRoll({
                atkName: delivery.spell.name,
                dmgType: delivery.spell.damageType,
                dice: [new DiceRoll({
                    count: delivery.damageDice + delivery.studyDamageDice,
                    faces: HeroAttack.SPELL_DIE_SIZE + dieSizeMod,
                    modifier: 0,
                    explodesOn: explosionsMod as number[]
                })],
                flatDmgBonus: (hero.modifiers.damage.out.all ?? 0) + (hero.modifiers.damage.out.spell ?? 0),
                perDieDmgBonus: (hero.modifiers.damage.out.allPerDie ?? 0) + (hero.modifiers.damage.out.spellPerDie ?? 0)
            })
        }
        else {
            /**
             * Set this here for damageless spells in case user somehow
             * didn't check it in the UI to ensure the spell effect is
             * printed out in the chat card.
             */
            delivery.applyEffect = true
        }

        const attack = new HeroAttack(delivery.spell.name, actor, getTargetIds(), skillCheck, damageRoll)
        attack.itemId = delivery.spell.uuid
        attack.spellDelivery = delivery.toJson()
        attack.skipSkillCheck = delivery instanceof Imbue

        return attack
    }

    static async buildCustomRoll(actor: Actor & { system: HeroDataModel }, preset: RollPreset) {
        const makeSkillCheck = (type: SkillCheckType) => {
            return new SkillCheck(actor.system, {
                type: type,
                skill: preset.skill,
                d20Count: preset.d20Count,
                modifier: preset.skillCheckMod,
                critThreshold: preset.critThreshold,
                favorHinder: preset.favorHinder
            })
        }

        const makeDamageRoll = (weapon: (Item & { system: WeaponDataModel }) | undefined, title: string) => {
            return new DamageRoll({
                atkName: title,
                dice: preset.damageRolls.map(rollSchema => new DiceRoll(rollSchema)),
                dmgType: weapon?.system?.damage?.type ?? 'physical',
                flatDmgBonus: preset.flatModifier,
                perDieDmgBonus: preset.perDieBonus,
                armorPiercing: preset.armorPiercing
            })
        }

        if (preset.skill && preset.damageRolls && preset.damageRolls.length > 0) {
            const weapon = actor.items.find(it => it.id === preset.weaponId) as Item & { system: WeaponDataModel }

            const title = (weapon?.name ? weapon.name + ": " : "") + preset.description
            const skillCheck = makeSkillCheck('attack')
            const damageRoll = makeDamageRoll(weapon, title)

            const attack = new HeroAttack(title, actor, getTargetIds(), skillCheck, damageRoll)
            attack.itemId = weapon?.id ?? ''
            attack.skipSkillCheck = preset.skill === '-'
            attack.initiate()
        }
        else if (preset.skill && !preset.damageRolls || preset.damageRolls.length === 0) {
            const result = await makeSkillCheck('check').roll()
            sendVagabondChatMessage(
                actor,
                createElement(SkillCheckChatCard, { actorId: actor.id ?? '', result: result }),
                result.rolls
            )
        }
    }

    static getHighestDefaultWeaponSkill(hero: HeroDataModel, weapon: WeaponDataModel): { skill: string, value: number } {
        const weaponSkills = [...weapon.skills]
        const defaultSkill = [...Object.keys(hero.skills), ...Object.keys(hero.saves)]
            .filter(k => weaponSkills.includes(k))
            .map(k => ({ skill: k, value: hero.skills[k]?.value ?? hero.saves[k] ?? 0 }))
            .sort((a, b) => a.value - b.value)[0]
        return defaultSkill
    }

}