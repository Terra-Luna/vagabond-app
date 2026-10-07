import { createElement } from "react"

import { RollPreset } from "../../apps/attack-builder/model/RollPreset"
import { RelicPowerProcessor } from "../../apps/vagabond-tools/relic/RelicPowerProcessor"
import { getManaEnforcement } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AlchemicalItemDataModel } from "../../model/item/equip/AlchemicalItemDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { roll3dDice } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getTargetIds, inventoryItemTypes } from "../../utils/modelUtil"
import { sendVagabondChatCard, sendVagabondChatMessage } from "../../view/chat/ChatCardSerializer"
import { SkillCheckChatCard } from "../../view/chat/SkillCheckChatCard"
import { Imbue, SpellDelivery, SpellDeliverySnapshot } from "../spellcasting/SpellDelivery"
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
    isDefenseCheck: boolean = false
    critChoice?: 'luck' | 'damage' | 'spellFx'
    isRerolled: boolean = false

    constructor(
        title: string,
        actor: Actor & { system: HeroDataModel },
        targetIds?: string[],
        skillCheck?: SkillCheck,
        isDefenseCheck?: boolean,
        damageRoll?: DamageRoll
    ) {
        super(title)
        this.actor = actor
        this.targetIds = targetIds ? [...targetIds] : []
        this.skillCheck = skillCheck
        this.isDefenseCheck = !!isDefenseCheck
        this.damageRoll = damageRoll
    }

    private get isSuccessOrCrit(): boolean {
        return this.skillCheck?.result?.outcome !== appLang.RollResult.failure
    }

    private get isCrit(): boolean {
        return this.skillCheck?.result?.outcome === appLang.RollResult.crit
    }

    // Inherited from Attack.
    protected override get isCriticalHit(): boolean {
        return this.isCrit
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
        const hasPermission = game.user?.isActiveGM || game.user?.id === this.userId
        return hasPermission && !this.critChoice
    }

    get isSpellAttack(): boolean {
        return !!this.spellDelivery
    }

    get isEffectOnlySpellAttack(): boolean {
        return (this.spellDelivery?.applyEffect ?? false) && (!this.damageRoll || this.damageRoll?.result?.total === 0)
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

    async initiate(clickEvent?: any, options?: { isDefenseCheck?: boolean }) {
        this.id = foundry.utils.randomID()
        this.skipSkillCheck = this.skipSkillCheck || clickEvent?.altKey
        this.isDefenseCheck = !!options?.isDefenseCheck

        if (this.skillCheck && (
            this.hasHostileTargets ||
            options?.isDefenseCheck || (
                this.isSpellAttack && (this.spellDelivery?.upcast ?? 0) > 0 &&
                this.spellDelivery?.spell?.upcastableEffectDieRoll
            )
        ) && !this.skipSkillCheck) {
            if (clickEvent?.shiftKey || clickEvent?.ctrlKey) {
                this.skillCheck.setFavorHinder(clickEvent)
            }
            await this.rollSkillCheck()
        }

        if (this.isEligibleForDmgRoll && this.isSuccessOrCrit) {
            if (this.isDefenseCheck && this.damageRoll) {
                this.damageRoll.flatDmgBonus = 0
                this.damageRoll.perDieDmgBonus = 0
            }
            await this.rollDamage(this.skillCheck?.result?.outcome === appLang.RollResult.crit)
        }

        await this.save(serializeAttack)
        await sendVagabondChatCard(
            this.actor,
            "InteractiveAttackChatCard",
            { actorId: this.actor.id!, attackId: this.id },
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
                this.skillCheck?.result.outcome !== appLang.RollResult.failure &&
                this.isEligibleForDmgRoll
            ) {
                await this.rollDamage(this.skillCheck.result.outcome === appLang.RollResult.crit)
                await this.save(serializeAttack)
            }
            else {
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

            if (!this.skillCheck.result.d6s?.length) {
                const d6 = await new Roll("1d6").evaluate()
                newResult.d6s = [d6.total]
                newResult.total += d6.total
                newResult.rolls.push(d6)
                newResult.favorHinder = appLang.FavorHinder.favor

                if (newResult.total >= result.difficulty) {
                    newResult.outcome = appLang.RollResult.success
                }

                this.skillCheck.result = newResult
                this.setFavored()

                roll3dDice([d6])

                if (newResult.outcome !== appLang.RollResult.failure) {
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
        if (this.skillCheck && this.skillCheck.result && !this.skillCheck.result.d6s?.length) {
            const result = this.skillCheck.result
            const newResult = { ...result }
            const d6 = await new Roll("1d6").evaluate()
            newResult.d6s = [d6.total]
            newResult.total -= d6.total
            newResult.rolls.push(d6)
            newResult.favorHinder = appLang.FavorHinder.hinder

            if (newResult.total >= result.difficulty) {
                newResult.outcome = appLang.RollResult.success
            }
            else {
                newResult.outcome = appLang.RollResult.failure
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
        if (this.skillCheck && this.skillCheck.isHindered && this.skillCheck.result && this.skillCheck.result.d6s?.length) {
            const result = this.skillCheck.result
            const newResult = { ...result }
            newResult.total += newResult.d6s.reduce((a, b) => a + b, 0)
            newResult.d6s = []
            newResult.favorHinder = appLang.FavorHinder.none
            newResult.rolls = newResult.rolls.filter(r => getDiceTerms(r).flatMap(t => t.faces).includes(20))

            if (newResult.total >= result.difficulty) {
                newResult.outcome = appLang.RollResult.success
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
            const critDmg = skill.trained
                ? (20 - skill.value) / 2
                : 20 - skill.value
            this.damageRoll.result.bonus += critDmg
            this.damageRoll.result.total += critDmg
            await this.save(serializeAttack)
        }
    }

    async addCritSpellFx() {
        this.critChoice = 'spellFx'
        if (this.spellDelivery) {
            this.spellDelivery.applyEffect = true
            this.spellDelivery.spell.appliedEffects.forEach(eff => {
                this.appliedEffects.push({
                    ...eff,
                    damageType: this.spellDelivery?.spell.damageType
                })
            })
        }
        await this.save(serializeAttack)
    }

    static buildWeaponAttack(
        actor: Actor & { system: HeroDataModel },
        item: Item & { system: WeaponDataModel },
        skill?: string
    ): HeroAttack {
        const hero = actor.system
        const weapon = foundry.utils.deepClone(item.system)
        const mods = hero.modifiers

        let weaponSkill = skill

        // If a skill wasn't provided for the skill check, use the highest applicable skill.
        if (!weaponSkill) {
            const defaultSkill = HeroAttack.getHighestDefaultWeaponSkill(hero, weapon)
            weaponSkill = defaultSkill?.skill ?? 'melee'
        }

        /**
         * Add weapon props granted by modifiers.
         */
        const weaponPropGrants = [
            ...mods?.damage?.out?.global?.properties?.granted ?? [],
            ...mods?.damage?.out[weaponSkill!]?.properties?.granted ?? []
        ]
        weapon.properties = [...weapon.properties, ...weaponPropGrants.filter(prop => !weapon.properties.includes(prop))]

        /**
         * Add linked weapon properties defined by modifiers.
         */
        const weaponPropLinks = [
            ...mods?.damage?.out?.global?.properties?.linked ?? [],
            ...mods?.damage?.out[weaponSkill!]?.properties?.linked ?? []
        ]
        if (weapon.properties?.some(prop => weaponPropLinks.includes(prop))) {
            weapon.properties = [...weapon.properties, ...weaponPropLinks.filter(prop => !weapon.properties.includes(prop))]
        }

        const isKeen = hero.skills[weaponSkill]?.trained && weapon.properties.includes('keen')

        const skillCheck = new SkillCheck(hero, {
            type: 'attack',
            item: item.system,
            skill: weaponSkill!,
            critSum: mods?.skillCheck?.attack?.sumCrit || mods?.skillCheck?.[weaponSkill!]?.sumCrit
        })

        skillCheck.critThreshold -= (isKeen ? 1 : 0)

        /**
         * Weapon damage with modifiers.
         */
        const damageDice = new DiceRoll(
            DiceRoll.getItemDamageWithHeroMods(hero, weaponSkill, weapon)
        )

        /**
         * Add any extra dice granted by modifiers.
         */
        const dmgMods = foundry.utils.deepClone(mods.damage.out)
        const extraDice: DiceRoll[] = []
        const globalExtraDice = dmgMods.global?.dice?.extra
        const skillExtraDice = dmgMods[weaponSkill!]?.dice?.extra
        const keenExtraDice = isKeen ? dmgMods.keen?.dice?.extra : undefined

        const addRoll = (roll: typeof globalExtraDice | typeof skillExtraDice | typeof keenExtraDice) => {
            extraDice.push(new DiceRoll({
                count: roll.count,
                faces: roll.faces > 0 ? roll.faces : damageDice.faces,
                modifier: roll.modifier,
                explodesOn: roll.explodesOn?.filter((value): value is number => typeof value === 'number')
            }))
        }

        if (globalExtraDice?.count ?? 0 > 0) addRoll(globalExtraDice)
        else if (skillExtraDice?.count ?? 0 > 0) addRoll(skillExtraDice)
        else if (keenExtraDice?.count ?? 0 > 0) addRoll(keenExtraDice)

        /**
         * Determine weapon's Relic level.
         */
        let relicLevel = -1
        if (weapon.relicPowers.length > 0) {
            relicLevel = 0
            if (weapon.relicPowers.some(it => it.id.includes('bonus-weapon'))) {
                const weaponPowers = weapon.relicPowers.filter(it => it.id.includes('bonus-weapon'))
                relicLevel = weaponPowers.some(it => it.id === 'bonus-weapon-3')
                    ? 3
                    : (weaponPowers.some(it => it.id === 'bonus-weapon-2')
                        ? 2
                        : (weaponPowers.some(it => it.id === 'bonus-weapon-1')
                            ? 1
                            : 0
                        )
                    )
            }
        }

        const damageRoll = new DamageRoll({
            atkName: item.name,
            dmgType: weapon.damage.type,
            dice: [damageDice, ...extraDice ?? []],
            perDieDmgBonus: (dmgMods.global?.bonus?.perDie ?? 0) + (dmgMods[weaponSkill]?.bonus?.perDie ?? 0),
            armorPiercing: dmgMods[weaponSkill]?.armorPiercing?.flat ?? (isKeen ? dmgMods.keen.armorPiercing.flat ?? 0 : 0),
            armorPiercingPerDie: dmgMods[weaponSkill]?.armorPiercing?.perDie ?? (isKeen ? dmgMods.keen.armorPiercing.perDie ?? 0 : 0),
            armorPiercingPerExtraDie: dmgMods[weaponSkill]?.armorPiercing?.perExtraDie ?? (isKeen ? dmgMods.keen.armorPiercing.perExtraDie ?? 0 : 0),
            relicLevel: relicLevel
        })

        const attack = new HeroAttack(item.name, actor, getTargetIds(), skillCheck, false, damageRoll)
        attack.itemId = item.uuid

        return attack
    }

    static buildAlchemyAttack(
        actor: Actor & { system: HeroDataModel },
        item: Item & { system: AlchemicalItemDataModel },
        e?: any
    ): HeroAttack {
        const skillCheck = new SkillCheck(actor.system, { type: 'attack', item: item.system, skill: "craft", clickEvent: e })
        const damageDice = new DiceRoll(DiceRoll.getItemDamageWithHeroMods(actor.system, 'craft', item.system))

        const mods = foundry.utils.deepClone((actor as any).system.modifiers.damage.out.alchemy)
        const dieSize = item.system.damage.dice.faces
        const flatBonus = mods.bonus?.flat ?? 0
        const perDieBonus = mods.bonus?.perDie ?? 0
        const explodesOn = [...mods.exploding?.values ?? []]
        if (mods.exploding?.max && !explodesOn.includes(dieSize)) {
            explodesOn.push(dieSize)
        }
        if (mods.exploding?.subMax && !explodesOn.includes(dieSize - 1)) {
            explodesOn.push(dieSize - 1)
        }
        damageDice.explodesOn = explodesOn

        const damageRoll = new DamageRoll({
            atkName: item.name,
            dmgType: item.system.damage.type,
            flatDmgBonus: flatBonus,
            perDieDmgBonus: perDieBonus,
            dice: [damageDice]
        })

        const attack = new HeroAttack(item.name, actor, getTargetIds(), skillCheck, false, damageRoll)
        attack.itemId = item.uuid
        attack.appliedEffects = item.system.appliedEffects?.map(eff => ({ ...eff, damageType: item.system.damage.type })) ?? []

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
            delivery.manaCost > hero.mana.value || delivery.manaCost > hero.mana.maxCast
        )) { return null }

        const updates: any = {}
        if (delivery.manaCost > 0) {
            updates['system.mana.value'] = Math.max(0, hero.mana.value - delivery.manaCost)
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
            const mods = foundry.utils.deepClone(hero.modifiers)
            const isHealing = delivery.spell.damageType === 'healing'

            const equippedItems = actor.items.filter(it => inventoryItemTypes().includes(it.type) && (it as any).system.isEquipped) as any[]
            RelicPowerProcessor.applyRelicPowers(equippedItems.flatMap(it => it.system.relicPowers), mods)

            const dieSizeMod = isHealing
                ? mods.healing.out.spell.dice.size.bonus ?? 0
                : mods.damage.out.spell.dice.size.bonus ?? 0

            const explosionsMod = isHealing
                ? mods.healing.out.spell.dice.exploding.values
                : mods.damage.out.spell.dice.exploding.values

            const weak = !isHealing && (mods.damage.out.global.conditional.weak || mods.damage.out.spell.conditional.weak)

            damageRoll = new DamageRoll({
                atkName: delivery.spell.name,
                dmgType: delivery.spell.damageType,
                dice: [new DiceRoll({
                    count: delivery.damageDice + delivery.studyDamageDice + (weak ? 1 : 0),
                    faces: HeroAttack.SPELL_DIE_SIZE + dieSizeMod,
                    modifier: 0,
                    explodesOn: explosionsMod as number[]
                })],
                flatDmgBonus: isHealing
                    ? (mods.healing.out.spell.bonus.flat ?? 0)
                    : (mods.damage.out.spell.bonus.flat ?? 0),
                perDieDmgBonus: isHealing
                    ? (mods.healing.out.spell.bonus.perDie ?? 0)
                    : (mods.damage.out.spell.bonus.perDie ?? 0)
            })
        }
        else {
            /**
             * Set this here for damageless spells in case user somehow
             * didn't check it in the UI to ensure the spell effect is
             * printed out in the chat card.
             */
            delivery.applyEffect = true
            if (delivery.spell.upcastableEffectDieRoll && delivery.upcast > 0) {
                damageRoll = new DamageRoll({
                    atkName: delivery.spell.name,
                    dmgType: 'none',
                    dice: [new DiceRoll({
                        count: delivery.upcast,
                        faces: HeroAttack.SPELL_DIE_SIZE
                    })]
                })
            }
        }

        const attack = new HeroAttack(delivery.spell.name, actor, getTargetIds(), skillCheck, false, damageRoll)
        attack.itemId = delivery.spell.uuid
        attack.spellDelivery = delivery.toJson()
        attack.appliedEffects = delivery.applyEffect ? delivery.spell.appliedEffects?.map(eff => ({ ...eff, damageType: delivery.spell.damageType })) ?? [] : []
        attack.skipSkillCheck = delivery instanceof Imbue

        return attack
    }

    static async buildCustomRoll(actor: Actor & { system: HeroDataModel }, preset: RollPreset, clickEvent?: any) {
        const makeSkillCheck = (type: SkillCheckType) => {
            return new SkillCheck(actor.system, {
                type: type,
                skill: preset.skill,
                d20Count: preset.d20Count,
                modifier: preset.skillCheckMod,
                critThreshold: preset.critThreshold,
                critSum: preset.critSum,
                explodeFavor: preset.explodeFavor,
                favorHinder: preset.favorHinder,
                clickEvent: clickEvent
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

            const attack = new HeroAttack(title, actor, getTargetIds(), skillCheck, false, damageRoll)
            attack.itemId = weapon?.id ?? ''
            attack.skipSkillCheck = preset.skill === '-'

            attack.initiate(clickEvent)
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

    override shouldApplyDamageToTarget(targetId: string): boolean {
        const actor = canvas?.scene?.tokens?.get(targetId)?.actor

        if (actor?.system instanceof AdversaryDataModel) {
            const immunities = actor.system.modifiers.damage.in.immunities ?? []

            if (!this.isSpellAttack && ["physical", "blunt", "slash", "pierce"].includes(this.damageRoll?.dmgType ?? "")) {
                if (immunities.some(i => i.includes("physical_lt"))) {
                    const threshold = Number(immunities.find(i => i.includes("physical_lt"))?.split("physical_lt")[1] ?? "1")
                    const atkRelicPow = this.damageRoll?.relicLevel ?? -1

                    return super.shouldApplyDamageToTarget(targetId) && (atkRelicPow >= threshold)
                }
            }
        }

        return super.shouldApplyDamageToTarget(targetId)
    }

}