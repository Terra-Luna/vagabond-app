import { api } from "../../apps/api/VagabondAPI"
import type { RollPreset } from "../../apps/attack-builder/model/RollPreset"
import { RelicPowerProcessor } from "../../apps/vagabond-tools/relic/RelicPowerProcessor"
import {
  getAllowLateLuckStudy,
  getAttackRegistry,
  getManaEnforcement,
} from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AlchemicalItemDataModel } from "../../model/item/equip/AlchemicalItemDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { roll3dDice, sys_id } from "../../util/foundry-util"
import { appLang } from "../../util/lang"
import { localizeString } from "../../util/locale-util"
import {
  canInitiateAttack,
  getTargetIds,
  isActorInScene,
} from "../../util/model-util"
import { sendVagabondChatCard } from "../../view/chat/ChatCardSerializer"
import {
  Imbue,
  SpellDelivery,
  type SpellDeliverySnapshot,
} from "../spellcasting/SpellDelivery"
import { AppliedFx, Attack } from "./Attack"
import { DamageRoll } from "./roll/DamageRoll"
import { DiceRoll } from "./roll/DiceRoll"
import {
  SkillCheck,
  type SkillCheckResult,
  type SkillCheckType,
} from "./roll/SkillCheck"
import { deserializeAttack } from "./util/attack-deserializer"
import { serializeAttack } from "./util/attack-serializer"
import { getDiceTerms } from "./util/dice-util"
import { HuntersMark } from "./util/HuntersMark"

export class HeroAttack extends Attack<Actor & { system: HeroDataModel }> {
  static SPELL_DIE_SIZE = 6
  override readonly attackType = "hero" as const

  itemId: string = ""
  weaponProperties: string[] = []
  skipSkillCheck: boolean = false
  requiresTargets: boolean = false
  spellDelivery: SpellDeliverySnapshot | undefined
  skillCheck?: SkillCheck
  isDefenseCheck: boolean = false
  critChoice?: "luck" | "damage" | "spellFx"
  isRerolled: boolean = false

  constructor(
    title: string,
    actor: Actor & { system: HeroDataModel },
    targetIds?: string[],
    skillCheck?: SkillCheck,
    isDefenseCheck?: boolean,
    damageRoll?: DamageRoll,
  ) {
    super(title, actor, targetIds ? [...targetIds] : [], damageRoll)
    this.skillCheck = skillCheck
    this.isDefenseCheck = !!isDefenseCheck
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
    const dice = this.damageRoll.dice.flatMap((d) => d.count)
    const damageDiceCount = dice.reduce((sum, d) => {
      return sum + d
    }, 0)
    return damageDiceCount > 0
  }

  get hasHostileTargets(): boolean {
    if (!this.targetIds || this.targetIds.length === 0) return false
    return (
      this.targetIds.some(
        (id) => canvas?.scene?.tokens.get(id)?.disposition === -1,
      ) ?? false
    )
  }

  get showSkillCheck(): boolean {
    return !!this.skillCheck?.result?.outcome && !this.skipSkillCheck
  }

  get showCritChoices(): boolean {
    if (!this.isCrit) return false
    const hasPermission = game.user?.isActiveGM || game.user?.id === this.userId
    return hasPermission && !this.critChoice
  }

  override get isSpellAttack(): boolean {
    return !!this.spellDelivery
  }

  override get isImbuable(): boolean {
    if (this.isSpellAttack || this.isDefenseCheck) return false

    const items = this.actor.items as Collection<Item>
    let weapon: any =
      items.get(this.itemId) ?? items.get(this.itemId?.split(".").pop() ?? "")
    if (!weapon && this.itemId?.includes(".")) {
      try {
        weapon = fromUuidSync(this.itemId as any)
      }
      catch {
        weapon = undefined
      }
    }
    return weapon?.type !== "alchemical" && !weapon?.system?.imbueExempt
  }

  override get isEffectOnlySpellAttack(): boolean {
    return (
      (this.spellDelivery?.applyEffect ?? false) &&
      (!this.damageRoll || this.damageRoll?.result?.total === 0)
    )
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
    return (
      (isSuccess && isDmgOrEffect) || (!this.hasHostileTargets && isDmgOrEffect)
    )
  }

  async initiate(
    clickEvent?: any,
    options?: { isDefenseCheck?: boolean; skipChatCard?: boolean },
  ) {
    if (!canInitiateAttack(this.actor)) return
    if (
      this.requiresTargets &&
      !options?.isDefenseCheck &&
      this.targetIds.length === 0
    ) {
      ui.notifications?.error(appLang.Attack.noTargetsSelected)
      return
    }
    this.id = foundry.utils.randomID()
    this.skipSkillCheck = this.skipSkillCheck || clickEvent?.altKey
    this.isDefenseCheck = !!options?.isDefenseCheck

    if (this.shouldRollSkillCheck) {
      if (clickEvent?.shiftKey || clickEvent?.ctrlKey) {
        this.skillCheck!.setFavorHinder(
          clickEvent,
          foundry.utils.deepClone(this.actor?.system?.modifiers),
        )
      }
      await this.rollSkillCheck()
    }

    if (this.isEligibleForDmgRoll && this.isSuccessOrCrit) {
      await this.rollInitialDamage()
    }

    this.applyPostRollEffects()

    if (options?.skipChatCard) return

    await this.sendChatCard()
  }

  private get shouldRollSkillCheck(): boolean {
    if (!this.skillCheck || this.skipSkillCheck) return false
    const isUpcastEffectRoll =
      this.isSpellAttack &&
      (this.spellDelivery?.upcast ?? 0) > 0 &&
      !!this.spellDelivery?.spell?.upcastableEffectDieRoll
    return this.hasHostileTargets || this.isDefenseCheck || isUpcastEffectRoll
  }

  private async rollInitialDamage() {
    // A defense roll is only the weapon's dice - damage bonuses don't apply to armor.
    if (this.isDefenseCheck) this.damageRoll?.clearBonuses()

    const isCrit = this.skillCheck?.result?.outcome === appLang.RollResult.crit
    await this.rollDamage(isCrit)
    if (this.isDefenseCheck && isCrit)
      this.damageRoll?.addResultBonus(this.critSkillBonus)
  }

  /**
   * A crit's bonus damage (or defense armor), based on the skill used for the check.
   */
  private get critSkillBonus(): number {
    const skill = this.skillCheck?.skill
      ? this.actor.system.skills[this.skillCheck.skill]
      : undefined
    if (!skill) return 0
    return skill.trained ? (20 - skill.value) / 2 : 20 - skill.value
  }

  private applyPostRollEffects() {
    // Update Focus, if available.
    if (
      this.isSpellAttack &&
      this.spellDelivery?.isFocused &&
      (this.skipSkillCheck || this.isSuccessOrCrit)
    ) {
      this.addFocus()
    }

    // Take user to polymorph menu...
    if (
      game.user?.id === this.userId &&
      this.isSpellAttack &&
      (fromUuidSync(this.itemId) as any)?.getFlag?.(sys_id, "polymorph")
    ) {
      if (this.actor.sheet?.rendered) {
        ;(Hooks as any).callAll(
          "vagabondSelectHeroTab",
          this.actor.id,
          "polymorph",
        )
      }
      else {
        api.util.polymorphApp(this.actor)
      }
    }
  }

  private addFocus() {
    const focus = this.actor.system.statuses.counters.focus ?? 0
    if (focus >= this.actor.system.maxFocus) {
      ui.notifications?.warn(appLang.Spellcasting.maxFocusMessage)
    }
    else {
      this.actor.update({
        "system.statuses.counters.focus": focus + 1,
      } as Record<string, number>)
    }
  }

  static findLatestWeaponAttack():
    | { actorId: string; attackId: string; isResolved: boolean }
    | undefined {
    const latest = Object.values(getAttackRegistry() as Record<string, any[]>)
      .flat()
      .filter(
        (snapshot) =>
          snapshot.type === "hero" &&
          !snapshot.isSpellAttack &&
          !snapshot.spellDelivery &&
          !snapshot.isDefenseCheck,
      )
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0]
    return latest
      ? {
          actorId: latest.actorId,
          attackId: latest.id,
          isResolved: !!latest.isResolved,
        }
      : undefined
  }

  static announceImbue(heroName: string) {
    const message = localizeString(appLang.Notifications.imbuingAttack, {
      name: heroName,
    })
    game.socket?.emit(`system.${sys_id}`, {
      action: "notifyInfo",
      data: { message },
    })
  }

  /**
   * Casts a spell with the Imbue delivery into an existing (unresolved) attack's chat card instead of
   * sending a new one. The spell's damage is rolled and stored on the target attack as an array
   * entry so several Heroes can imbue the same attack.
   */
  static async imbueAttack(
    actor: Actor & { system: HeroDataModel },
    skill: string,
    delivery: SpellDelivery,
    target: { actorId: string; attackId: string },
    clickEvent?: any,
  ): Promise<boolean> {
    const snapshot = (getAttackRegistry()[target.actorId] ?? []).find(
      (atk) => atk.id === target.attackId,
    )
    const baseAttack = snapshot
      ? deserializeAttack(
          snapshot,
          (title, owner, targetIds) => new HeroAttack(title, owner, targetIds),
        )
      : undefined

    if (!baseAttack?.isImbuable || baseAttack.isResolved) {
      ui.notifications?.warn(appLang.Notifications.imbueTargetUnavailable)
      return false
    }

    if (baseAttack.imbues.some((imbue) => imbue.actorId === actor.id)) {
      ui.notifications?.warn(
        localizeString(appLang.Notifications.alreadyImbued, {
          name: actor.name ?? "",
        }),
      )
      return false
    }

    if (!isActorInScene(actor)) {
      ui.notifications?.warn(
        localizeString(appLang.Notifications.imbueNotInScene, {
          name: actor.name ?? "",
        }),
      )
      return false
    }

    const dmgType = delivery.spell.damageType

    if (["healing", "mana"].includes(dmgType)) {
      ui.notifications?.warn(appLang.Notifications.imbueRequiresDamage)
      return false
    }

    const casterTargets = getTargetIds()
    if (
      casterTargets.length === 0 ||
      casterTargets.some((id) => !baseAttack.targetIds.includes(id))
    ) {
      ui.notifications?.warn(appLang.Notifications.imbueNoTargets)
      return false
    }

    const spellAttack = HeroAttack.buildSpellAttack(
      actor,
      skill,
      delivery,
      clickEvent,
    )
    if (!spellAttack) return false

    if (!spellAttack.damageRoll) {
      spellAttack.damageRoll = new DamageRoll({
        atkName: delivery.spell.name,
        dmgType: "none",
        dice: [],
      })
    }

    spellAttack.targetIds = [...casterTargets]
    await spellAttack.rollDamage(false)

    const latest = (getAttackRegistry()[target.actorId] ?? []).find(
      (atk) => atk.id === target.attackId,
    )
    const latestAttack = latest
      ? deserializeAttack(
          latest,
          (title, owner, targetIds) => new HeroAttack(title, owner, targetIds),
        )
      : undefined
    if (!latestAttack?.isImbuable || latestAttack.isResolved) return false

    if (latestAttack.imbues.some((imbue) => imbue.actorId === actor.id)) {
      ui.notifications?.warn(
        localizeString(appLang.Notifications.alreadyImbued, {
          name: actor.name ?? "",
        }),
      )
      return false
    }

    latestAttack.imbues.push({
      actorId: actor.id!,
      spellName: delivery.spell.name,
      spellUuid: delivery.spell.uuid,
      applyEffect: delivery.applyEffect,
      damageRoll: spellAttack.damageRoll,
      targetIds: casterTargets,
      appliedEffects: spellAttack.appliedEffects,
    })

    await latestAttack.save(serializeAttack)
    if (spellAttack.spellDelivery?.isFocused) spellAttack.addFocus()

    return true
  }

  setFavored() {
    if (this.skillCheck) {
      this.skillCheck.favorHinder = "favor"
    }
  }

  setHindered() {
    if (this.skillCheck) {
      this.skillCheck.favorHinder = "hinder"
    }
  }

  clearFavorHinder() {
    if (this.skillCheck) {
      this.skillCheck.favorHinder = "none"
    }
  }

  async rollSkillCheck(isReroll: boolean = false, animate: boolean = true) {
    if (!this.skillCheck) return

    this.isRerolled = isReroll
    await this.skillCheck?.roll(isReroll, animate)

    if (isReroll) {
      const luck = this.actor.system.statuses.counters.luck
      await this.actor.update(
        { "system.statuses.counters.luck": luck - 1 } as Record<string, number>,
        { ["skipTrackerChatCard" as string]: true },
      )

      if (
        this.skillCheck?.result &&
        this.skillCheck?.result.outcome !== appLang.RollResult.failure &&
        this.isEligibleForDmgRoll
      ) {
        await this.rollDamage(
          this.skillCheck.result.outcome === appLang.RollResult.crit,
        )
        await this.save(serializeAttack)
      }
      else {
        this.autoResolveIfOuttaLuck()
        await this.save(serializeAttack)
      }
    }
  }

  private autoResolveIfOuttaLuck() {
    if (this.isResolved || this.isDefenseCheck) return
    if (this.skillCheck?.result?.outcome !== appLang.RollResult.failure) return

    const { luck, studied } = this.actor.system.statuses.counters
    const canImprove =
      !this.isRerolled && (luck > 0 || (studied > 0 && getAllowLateLuckStudy()))
    if (!canImprove) this.isResolved = true
  }

  /**
   * Inserts a D6 roll into the results and adds it to the total.
   */
  async addLateFavor(resource: "luck" | "studied", currentValue: number) {
    if (this.skillCheck?.isFavored ?? false) {
      ui.notifications?.info(
        appLang.Notifications.cannotAddFavorToFavoredAttack,
      )
      return
    }

    if (this.skillCheck && this.skillCheck.result) {
      await this.actor.update(
        { [`system.statuses.counters.${resource}`]: currentValue - 1 },
        { ["skipTrackerChatCard" as string]: true },
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
          await this.damageRoll?.roll(false, this.hasWeakTarget)
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
      ui.notifications?.warn(appLang.Notifications.d6AlreadyAppliedToSkillCheck)
      return undefined
    }
  }

  /**
   * Inserts a D6 roll into the results and subtracts it to the total.
   */
  async addLateHinder() {
    if (
      this.skillCheck &&
      this.skillCheck.result &&
      !this.skillCheck.result.d6s?.length
    ) {
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
      ui.notifications?.warn(appLang.Notifications.d6AlreadyAppliedToSkillCheck)
      return undefined
    }
  }

  async removeHinderFromSkillCheck() {
    if (
      this.skillCheck &&
      this.skillCheck.isHindered &&
      this.skillCheck.result &&
      this.skillCheck.result.d6s?.length
    ) {
      const result = this.skillCheck.result
      const newResult = { ...result }
      newResult.total += newResult.d6s.reduce((a, b) => a + b, 0)
      newResult.d6s = []
      newResult.favorHinder = appLang.FavorHinder.none
      newResult.rolls = newResult.rolls.filter((r) =>
        getDiceTerms(r)
          .flatMap((t) => t.faces)
          .includes(20),
      )

      const wasFailure = result.outcome === appLang.RollResult.failure
      const isCrit = (newResult.d20s ?? []).some(
        (r) => r >= newResult.critThreshold,
      )
      newResult.outcome = isCrit
        ? appLang.RollResult.crit
        : newResult.total >= result.difficulty
          ? appLang.RollResult.success
          : appLang.RollResult.failure
      newResult.success = newResult.outcome !== appLang.RollResult.failure

      this.clearFavorHinder()
      this.skillCheck.result = newResult

      if (newResult.success) {
        this.isResolved = false
        if (wasFailure && this.isEligibleForDmgRoll) {
          await this.rollDamage(isCrit)
        }
      }
      else {
        this.isResolved = true
      }

      await this.save(serializeAttack)

      return result
    }
  }

  async addCritLuck() {
    this.critChoice = "luck"
    const luck = this.actor.system.statuses.counters.luck
    await this.actor.update(
      { "system.statuses.counters.luck": luck + 1 } as Record<string, number>,
      { ["skipTrackerChatCard" as string]: true },
    )
    await this.save(serializeAttack)
  }

  async addCritDamage() {
    if (!this.skillCheck) return

    if (this.skillCheck.skill && this.damageRoll?.result) {
      this.critChoice = "damage"
      this.damageRoll.addResultBonus(this.critSkillBonus)
      await this.save(serializeAttack)
    }
  }

  async removeTarget(targetId: string) {
    await super.removeTarget(targetId, serializeAttack)
  }

  async addCritSpellFx() {
    this.critChoice = "spellFx"
    if (this.spellDelivery) {
      this.spellDelivery.applyEffect = true
      this.spellDelivery.spell.appliedEffects.forEach((eff) => {
        this.appliedEffects.push({
          ...eff,
          damageType: this.spellDelivery?.spell.damageType,
        })
      })
    }
    await this.save(serializeAttack)
  }

  /**
   * Rolls a hero's defense against an adversary attack. A single defense check is made with the first
   * defense weapon, then all equipped defenses weapons' damage dice are rolled. The sum becomes an armor
   * bonus for the specific incoming attack.
   */
  static async rollDefense(
    hero: HeroDataModel,
    options?: { clickEvent?: any; favorHinder?: "favor" | "hinder" | "none" },
  ): Promise<{ result: SkillCheckResult; armorBonus: number } | undefined> {
    const [checkWeapon] = hero.defenseWeapons()
    if (!checkWeapon) return

    const clickEvent = options?.clickEvent
      ? {
          shiftKey: options.clickEvent.shiftKey,
          ctrlKey: options.clickEvent.ctrlKey,
        }
      : undefined

    const checkAttack = HeroAttack.buildWeaponAttack(
      hero.parent,
      checkWeapon,
      undefined,
      true,
    )
    if (options?.favorHinder && checkAttack.skillCheck)
      checkAttack.skillCheck.favorHinder = options.favorHinder
    await checkAttack.initiate(clickEvent, {
      isDefenseCheck: true,
      skipChatCard: true,
    })

    const result = checkAttack.skillCheck?.result
    if (!result) return

    return {
      result,
      armorBonus: HeroAttack.getDefenseArmorBonus(hero, checkAttack),
    }
  }

  /**
   * Armor granted by a completed defense check: the rolled defense dice (which already include
   * the crit bonus) on a success.
   */
  static getDefenseArmorBonus(
    _hero: HeroDataModel,
    checkAttack: HeroAttack,
  ): number {
    const result = checkAttack.skillCheck?.result
    if (!result || result.outcome === appLang.RollResult.failure) return 0
    return checkAttack.damageRoll?.result?.total ?? 0
  }

  async sendChatCard() {
    this.autoResolveIfOuttaLuck()
    await this.save(serializeAttack)
    await this.postChatCard()
  }

  static buildWeaponAttack(
    actor: Actor & { system: HeroDataModel },
    item: Item & { system: WeaponDataModel },
    skill?: string,
    defenseCheck?: boolean,
  ): HeroAttack {
    const hero = actor.system
    const weapon: WeaponDataModel = Object.create(item.system)
    const mods = foundry.utils.deepClone(hero.modifiers)
    if (HuntersMark.isAttackingMark(actor.id ?? undefined, getTargetIds()))
      HuntersMark.applyMarkBenefitsToModifiers(mods)

    let weaponSkill = skill

    // If a skill wasn't provided for the skill check, use the best applicable skill.
    if (!weaponSkill) {
      const defaultSkill = HeroAttack.getDefaultWeaponSkill(hero, weapon)
      weaponSkill = defaultSkill?.skill ?? "melee"
    }

    if (weapon instanceof WeaponDataModel) {
      RelicPowerProcessor.applyRelicPowers(
        RelicPowerProcessor.getEffectivePowers(item.system) as any,
        mods,
        { skillTrained: hero.skills[weaponSkill]?.trained ?? false },
      )
    }

    /**
     * Add weapon props granted by modifiers.
     */
    weapon.properties = HeroAttack.getModifiedWeaponProperties(
      weapon.properties,
      mods,
      weaponSkill,
    )

    const isKeen =
      hero.skills[weaponSkill]?.trained && weapon.properties.includes("keen")

    const skillCheck = new SkillCheck(hero, {
      type: "attack",
      item: weapon,
      skill: weaponSkill!,
      critSum:
        mods?.skillCheck?.attack?.sumCrit ||
        mods?.skillCheck?.[weaponSkill!]?.sumCrit,
    })

    skillCheck.critThreshold -= isKeen ? 1 : 0

    /**
     * Weapon damage with modifiers.
     */
    const damageDice = new DiceRoll(
      DiceRoll.getItemDamageWithHeroMods(hero, weaponSkill, weapon),
    )

    const dmgMods = foundry.utils.deepClone(mods.damage.out)
    const extraDice = HeroAttack.getExtraDamageDice(
      dmgMods,
      weaponSkill,
      !!isKeen,
      damageDice.faces,
    )
    const relicLevel = HeroAttack.getRelicLevel(
      RelicPowerProcessor.getEffectivePowers(item.system),
    )
    const baneTypes = RelicPowerProcessor.getBaneBeingTypes(
      RelicPowerProcessor.getEffectivePowers(item.system) as any,
    )

    const damageRoll = new DamageRoll({
      atkName: item.name,
      dmgType: weapon.damage.type,
      dice: [damageDice, ...extraDice],
      weaknessDie: { faces: damageDice.faces, count: 1 },
      baneTypes: baneTypes.length > 0 ? baneTypes : undefined,
      attackerId: actor.id ?? undefined,
      hdMultiplier:
        (dmgMods.global?.bonus?.hdMultiplier ?? 0) +
        (dmgMods[weaponSkill]?.bonus?.hdMultiplier ?? 0),
      hdMultiplierOnCrit:
        (dmgMods.global?.bonus?.hdMultiplierOnCrit ?? 0) +
        (dmgMods[weaponSkill]?.bonus?.hdMultiplierOnCrit ?? 0),
      relicLevel: relicLevel,
      perDieDmgBonus:
        (dmgMods.global?.bonus?.perDie ?? 0) +
        (dmgMods[weaponSkill]?.bonus?.perDie ?? 0),
      armorPiercing:
        dmgMods.global?.armorPiercing?.flat ||
        dmgMods[weaponSkill]?.armorPiercing?.flat ||
        (isKeen ? dmgMods.keen.armorPiercing.flat || 0 : 0),
      armorPiercingPerDie:
        dmgMods.global?.armorPiercing?.perDie ||
        dmgMods[weaponSkill]?.armorPiercing?.perDie ||
        (isKeen ? dmgMods.keen.armorPiercing.perDie || 0 : 0),
      armorPiercingPerExtraDie:
        dmgMods.global?.armorPiercing?.perExtraDie ||
        dmgMods[weaponSkill]?.armorPiercing?.perExtraDie ||
        (isKeen ? dmgMods.keen.armorPiercing.perExtraDie || 0 : 0),
    })

    const attack = new HeroAttack(
      item.name,
      actor,
      getTargetIds(),
      skillCheck,
      false,
      damageRoll,
    )
    attack.itemId = item.uuid
    attack.weaponProperties = [...weapon.properties]
    attack.requiresTargets = !defenseCheck

    if (defenseCheck) {
      const defenseWeapons = actor.system.defenseWeapons()
      if (defenseWeapons && defenseWeapons.length > 0) {
        const rolls = defenseWeapons
          .filter((it) => it.id !== item.id)
          .map((it) => {
            const atk = HeroAttack.buildWeaponAttack(actor, it)
            atk.itemId = weapon.parent.uuid
            return atk
          })
        attack.title = defenseWeapons.map((it) => it.name).join(" & ")
        attack.damageRoll?.dice.push(
          ...rolls.flatMap((r) => r.damageRoll?.dice ?? []),
        )
      }
    }

    const weaponEffects = HeroAttack.getWeaponAppliedEffects(
      item.system["appliedEffects"] ?? [],
      RelicPowerProcessor.getEffectivePowers(item.system),
      weapon.damage.type,
    )
    if (weaponEffects.length) attack.appliedEffects = weaponEffects

    return attack
  }

  /**
   * Weapon properties plus any granted by modifiers, and those linked to a property the weapon already has.
   */
  private static getModifiedWeaponProperties(
    properties: string[],
    mods: HeroDataModel["modifiers"],
    skill: string,
  ): string[] {
    const out = mods?.damage?.out
    const granted = [
      ...(out?.global?.properties?.granted ?? []),
      ...(out?.[skill]?.properties?.granted ?? []),
    ]
    const linked = [
      ...(out?.global?.properties?.linked ?? []),
      ...(out?.[skill]?.properties?.linked ?? []),
    ]

    let result = [
      ...properties,
      ...granted.filter((prop) => !properties.includes(prop)),
    ]
    if (result.some((prop) => linked.includes(prop))) {
      result = [...result, ...linked.filter((prop) => !result.includes(prop))]
    }
    return result
  }

  /**
   * Extra dice granted by modifiers: global first, else the skill's, else Keen's.
   */
  private static getExtraDamageDice(
    dmgMods: any,
    skill: string,
    isKeen: boolean,
    defaultFaces: number,
  ): DiceRoll[] {
    const extra = [
      dmgMods.global?.dice?.extra,
      dmgMods[skill]?.dice?.extra,
      isKeen ? dmgMods.keen?.dice?.extra : undefined,
    ].find((roll) => (roll?.count ?? 0) > 0)
    if (!extra) return []

    return [
      new DiceRoll({
        count: extra.count,
        faces: extra.faces > 0 ? extra.faces : defaultFaces,
        modifier: extra.modifier,
        explodesOn: extra.explodesOn?.filter(
          (value): value is number => typeof value === "number",
        ),
      }),
    ]
  }

  /**
   * A weapon's Relic level: -1 if it isn't a relic, else the highest bonus-weapon tier (0 if none).
   */
  private static getRelicLevel(relicPowers: { id: string }[]): number {
    if (relicPowers.length === 0) return -1
    const tiers = relicPowers.map((it) =>
      Number(/^(?:bonus-weapon-|physical_lt)(\d+)$/.exec(it.id)?.[1] ?? 0),
    )
    return Math.max(0, ...tiers)
  }

  /**
   * A weapon's own applied effects plus any granted by relic powers (e.g. Burning).
   */
  private static getWeaponAppliedEffects(
    baseEffects: AppliedFx[],
    relicPowers: any,
    damageType: string,
  ): AppliedFx[] {
    const effects: AppliedFx[] = [...baseEffects]
    const relicEffects = RelicPowerProcessor.getRelicAppliedEffects(relicPowers)
    relicEffects.forEach((fx) => {
      if (
        !effects.some(
          (eff) =>
            eff.effect === fx.effect && (eff.duration ?? "") === fx.duration,
        )
      )
        effects.push(fx)
    })
    return effects.map((eff) => {
      const relicType = relicEffects.find(
        (fx) =>
          fx.effect === eff.effect && fx.duration === (eff.duration ?? ""),
      )?.damageType
      return { ...eff, damageType: relicType ?? damageType }
    })
  }

  static buildAlchemyAttack(
    actor: Actor & { system: HeroDataModel },
    item: Item & { system: AlchemicalItemDataModel },
  ): HeroAttack {
    const skillCheck = new SkillCheck(actor.system, {
      type: "attack",
      item: item.system,
      skill: "craft",
    })
    const damageDice = new DiceRoll(
      DiceRoll.getItemDamageWithHeroMods(actor.system, "craft", item.system),
    )

    const mods = foundry.utils.deepClone(
      (actor as any).system.modifiers.damage.out.alchemy,
    )
    const dieSize = item.system.damage.dice.faces
    const flatBonus = mods.bonus?.flat ?? 0
    const perDieBonus = mods.bonus?.perDie ?? 0
    const explodesOn = [...(mods.exploding?.values ?? [])]
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
      dice: [damageDice],
    })

    const attack = new HeroAttack(
      item.name,
      actor,
      getTargetIds(),
      skillCheck,
      false,
      damageRoll,
    )
    attack.itemId = item.uuid
    attack.appliedEffects =
      item.system.appliedEffects?.map((eff) => ({
        ...eff,
        damageType: item.system.damage.type,
      })) ?? []

    return attack
  }

  static buildSpellAttack(
    actor: Actor & { system: HeroDataModel },
    skill: string,
    delivery: SpellDelivery,
    clickEvent?: any,
  ): HeroAttack | null {
    const hero = actor.system

    if (!canInitiateAttack(actor)) return null

    if (
      getManaEnforcement() &&
      (delivery.manaCost > hero.mana.value ||
        delivery.manaCost > hero.mana.maxCast)
    ) {
      return null
    }

    const updates: any = {}
    if (delivery.manaCost > 0) {
      updates["system.mana.value"] = Math.max(
        0,
        hero.mana.value - delivery.manaCost,
      )
    }

    if (delivery.studyDamageDice > 0) {
      updates["system.statuses.counters.studied"] = Math.max(
        0,
        hero.statuses.counters.studied - delivery.studyDamageDice,
      )
    }

    if (updates) {
      actor.update(updates)
    }

    const skillCheck = new SkillCheck(hero, {
      type: "cast",
      skill: skill,
      clickEvent: clickEvent,
    })

    let damageRoll: DamageRoll | undefined = undefined

    if (delivery.damageDice > 0 && delivery.spell.damageType !== "none") {
      const mods = foundry.utils.deepClone(hero.modifiers)
      const isHealing = delivery.spell.damageType === "healing"

      const activeItems = actor.system.activeRelics() as any[]
      RelicPowerProcessor.applyRelicPowers(
        activeItems.flatMap((it) => it.system.activeRelicPowers()),
        mods,
      )

      const dieSizeMod = isHealing
        ? (mods.healing.out.spell.dice.size.bonus ?? 0)
        : (mods.damage.out.spell.dice.size.bonus ?? 0)

      const explosionsMod = isHealing
        ? mods.healing.out.spell.dice.exploding.values
        : mods.damage.out.spell.dice.exploding.values

      const weak =
        !isHealing &&
        (mods.damage.out.global.conditional.weak ||
          mods.damage.out.spell.conditional.weak)

      const flatBonus = isHealing
        ? (mods.healing.out.spell.bonus.flat ?? 0)
        : (mods.damage.out.global.bonus.flat ?? 0) +
          (mods.damage.out.spell.bonus.flat ?? 0)

      damageRoll = new DamageRoll({
        atkName: delivery.spell.name,
        dmgType: delivery.spell.damageType,
        dice: [
          new DiceRoll({
            count:
              delivery.damageDice + delivery.studyDamageDice + (weak ? 1 : 0),
            faces: HeroAttack.SPELL_DIE_SIZE + dieSizeMod,
            explodesOn: explosionsMod as number[],
          }),
        ],
        weaknessDie: isHealing
          ? undefined
          : { faces: HeroAttack.SPELL_DIE_SIZE + dieSizeMod, count: 1 },
        flatDmgBonus: flatBonus,
        perDieDmgBonus: isHealing
          ? (mods.healing.out.spell.bonus.perDie ?? 0)
          : (mods.damage.out.global.bonus.perDie ?? 0) +
            (mods.damage.out.spell.bonus.perDie ?? 0),
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
          dmgType: "none",
          dice: [
            new DiceRoll({
              count: delivery.upcast,
              faces: HeroAttack.SPELL_DIE_SIZE,
            }),
          ],
        })
      }
    }

    const attack = new HeroAttack(
      delivery.spell.name,
      actor,
      getTargetIds(),
      skillCheck,
      false,
      damageRoll,
    )
    attack.itemId = delivery.spell.uuid
    attack.spellDelivery = delivery.toJson()
    attack.appliedEffects = delivery.applyEffect
      ? (delivery.spell.appliedEffects?.map((eff) => ({
          ...eff,
          damageType: delivery.spell.damageType,
        })) ?? [])
      : []
    attack.skipSkillCheck = delivery instanceof Imbue

    return attack
  }

  static async buildCustomRoll(
    actor: Actor & { system: HeroDataModel },
    preset: RollPreset,
    clickEvent?: any,
    baseAttack?: HeroAttack,
  ) {
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
        clickEvent: clickEvent,
      })
    }

    const makeDamageRoll = (
      weapon: (Item & { system: WeaponDataModel }) | undefined,
      title: string,
    ) => {
      return new DamageRoll({
        atkName: title,
        dice: preset.damageRolls.map((rollSchema) => new DiceRoll(rollSchema)),
        dmgType: weapon?.system?.damage?.type ?? "physical",
        flatDmgBonus: preset.flatModifier,
        perDieDmgBonus: preset.perDieBonus,
        armorPiercing: preset.armorPiercing,
        relicLevel: baseAttack?.damageRoll?.relicLevel,
      })
    }

    if (baseAttack && preset.skill && preset.damageRolls?.length > 0) {
      const title =
        baseAttack.title + (preset.description ? `: ${preset.description}` : "")
      const damageRoll = makeDamageRoll(undefined, title)
      damageRoll.dmgType = baseAttack.damageRoll?.dmgType ?? "physical"

      const attack = new HeroAttack(
        title,
        actor,
        getTargetIds(),
        makeSkillCheck("attack"),
        false,
        damageRoll,
      )
      attack.itemId = baseAttack.itemId
      attack.appliedEffects = baseAttack.appliedEffects
      attack.skipSkillCheck = preset.skill === "-"

      attack.initiate(clickEvent)
    }
    else if (
      preset.skill &&
      preset.damageRolls &&
      preset.damageRolls.length > 0
    ) {
      const weapon = actor.items.find(
        (it) => it.id === preset.weaponId,
      ) as Item & { system: WeaponDataModel }
      if (!weapon || !weapon.system.isEquipped) return

      const title =
        (weapon?.name ? weapon.name + ": " : "") + preset.description
      const skillCheck = makeSkillCheck("attack")
      const damageRoll = makeDamageRoll(weapon, title)

      const attack = new HeroAttack(
        title,
        actor,
        getTargetIds(),
        skillCheck,
        false,
        damageRoll,
      )
      attack.itemId = weapon?.id ?? ""
      attack.skipSkillCheck = preset.skill === "-"

      attack.initiate(clickEvent)
    }
    else if (
      (preset.skill && !preset.damageRolls) ||
      preset.damageRolls.length === 0
    ) {
      const result = await makeSkillCheck("check").roll()
      sendVagabondChatCard(
        actor,
        "SkillCheckChatCard",
        { actorId: actor.id ?? "", result: result },
        result.rolls,
      )
    }
  }

  /**
   * Find the lowest (best) weapon skill and us it by default.
   * Players can override the skill used via the skill selector in the roll builder view.
   */
  static getDefaultWeaponSkill(
    hero: HeroDataModel,
    weapon: WeaponDataModel,
  ): { skill: string; value: number } {
    const weaponSkills = [...weapon.skills]
    const defaultSkill = [
      ...Object.keys(hero.skills),
      ...Object.keys(hero.saves),
    ]
      .filter((k) => weaponSkills.includes(k))
      .map((k) => ({
        skill: k,
        value: hero.skills[k]?.value ?? hero.saves[k] ?? 0,
      }))
      .sort((a, b) => a.value - b.value)[0]
    return defaultSkill
  }

  override shouldApplyDamageToTarget(targetId: string): boolean {
    const actor = canvas?.scene?.tokens?.get(targetId)?.actor

    if (actor?.system instanceof AdversaryDataModel) {
      const immunities = actor.system.modifiers.damage.in.immunities ?? []

      if (
        !this.isSpellAttack &&
        ["physical", "blunt", "slash", "pierce"].includes(
          this.damageRoll?.dmgType ?? "",
        )
      ) {
        if (immunities.some((i) => i.includes("physical_lt"))) {
          const threshold = Number(
            immunities
              .find((i) => i.includes("physical_lt"))
              ?.split("physical_lt")[1] ?? "1",
          )
          const atkRelicPow = this.damageRoll?.relicLevel ?? -1

          return (
            super.shouldApplyDamageToTarget(targetId) &&
            atkRelicPow >= threshold
          )
        }
      }
    }

    return super.shouldApplyDamageToTarget(targetId)
  }

  /**
   * Returning 'true' results in the attack meeting the target's death requirements: no requirements are
   * set, or at least one of the enabled requirements is met.
   */
  override checkDeathRequirements(
    deathRequirements: any,
    weaknesses: any[],
    targetActor?: any,
  ): boolean {
    if (!deathRequirements) return true

    const checks: boolean[] = []
    if (deathRequirements.relic)
      checks.push((this.damageRoll?.relicLevel ?? -1) > -1)
    if (deathRequirements.crit) checks.push(this.isCriticalHit)
    if (deathRequirements.weak)
      checks.push(
        !!this.damageRoll?.dmgType &&
          weaknesses.includes(this.damageRoll.dmgType),
      )
    if (deathRequirements.sunlight)
      checks.push(!!targetActor?.system?.modifiers?.misc?.inSunlight)

    return checks.length === 0 || checks.some(Boolean)
  }
}
