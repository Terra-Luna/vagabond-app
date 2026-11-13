import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { appLang } from "../../util/lang"
import type { EmitsLight } from "../engine/util/active-effect-fx"

export interface PlacedArea {
  sceneId: string
  /** Centers of the grid squares the area covers. Empty for areas that follow the caster. */
  cells: { x: number; y: number }[]
  /** Set for Auras and Cones: the area is recomputed from the caster's token whenever it moves or turns. */
  follow?: {
    kind: "aura" | "cone"
    size: number
    actorId: string
    tokenId?: string
  }
  /** CSS color of the area, taken from the spell's damage type. */
  color: string
  /** Image drawn in each square (Glyphs). */
  icon?: string
}

export interface SpellDeliverySnapshot {
  name: string
  applyEffect: boolean
  isFocused: boolean
  /** Set once the cast spent a Focus; links applied effects to that Focus. */
  focusId?: string
  /** The canvas area the caster marked; drawn for everyone while the Focus lasts. */
  area?: PlacedArea
  damageDice?: number
  isArea?: boolean
  /** Area deliveries: overall size, plus width and height for Lines. */
  size?: number
  width?: number
  height?: number
  upcast: number
  discount: number
  _manaCost: number
  spell: SpellSnapshot
  mods: DeliveryMods
}

export interface SpellSnapshot {
  uuid: string
  name: string
  img: string
  description: string
  damageType: string
  baseManaCost: number
  ignoreEffectCost: boolean
  upcastableEffect: boolean
  upcastableEffectDieRoll: boolean
  focusExempt?: boolean
  upkeep?: { force: boolean; perTarget: boolean }
  appliedEffects: { effect: string; duration: string; critDuration: string }[]
  appliedActiveEffects?: { uuid: string; duration?: string }[]
  emitsLight?: EmitsLight
  autoTargetingPref?: string
  /** Mana off the cast (negative adds to it), set by the ChoiceSet rule that granted the spell. */
  manaDiscount?: number
  /** Mana off the spell's Delivery, whichever one is used, set by the ChoiceSet rule that granted the spell. Adds to the modifiers' delivery discounts. */
  deliveryDiscount?: number
  /** The spell can only be cast at its delivery's base cost: no upcasting of any kind. */
  noUpcast?: boolean
  /** The spell can be upcast, but never to more than its delivery's base cost (after discounts). */
  noManaBoost?: boolean
  /** Damage and Active Effects dealt to tokens entering, or staying in, the spell's area. */
  surface?: SurfaceConfig
}

export interface SurfaceEffectConfig {
  /** A damage formula such as "1d6". */
  damage: string
  activeEffects: { uuid: string; duration?: string }[]
}

export interface SurfaceConfig {
  enabled: boolean
  onEnter: SurfaceEffectConfig
  onStay: SurfaceEffectConfig
}

export interface DeliveryMods {
  damageUpcastDiscount: number
  deliveryUpcastDiscount: number
  deliveryDiscounts?: {
    aura?: number
    cone?: number
    line?: number
    sphere?: number
    imbue?: number
  }
}

/**
 * Use the available update functions for each delivery type to have manaCost automatically updated.
 */
export abstract class SpellDelivery {

  abstract name: string
  abstract description: string
  abstract targetLabel: string
  abstract baseManaCost: number

  applyEffect = false
  isFocused = false
  /** Set just before casting a Focused spell, so the area can persist on the canvas. */
  area?: PlacedArea
  damageDice = 1
  upcast = 0
  studyDamageDice = 0
  discount = 0

  protected _manaCost = 0

  get manaCost() {
    return Math.max(0, this._manaCost - this.discount)
  }

  spell: SpellSnapshot
  mods: DeliveryMods

  constructor(spell: SpellSnapshot, mods: DeliveryMods) {
    this.spell = spell
    this.mods = mods
  }

  clone() {
    const Ctor = this.constructor as new (
      spell: SpellSnapshot,
      mods: DeliveryMods,
    ) => this
    const clone = new Ctor(this.spell, this.mods)
    Object.assign(clone, this)
    return clone
  }

  abstract calculateManaCost()

  setSpell(spell) {
    this.spell = spell
    if (spell.damageType === "none") {
      this.damageDice = 0
    }
    this.enforceFixedCost()
    this.calculateManaCost()
    this.enforceManaCap()
  }

  /** True when the spell can't be upcast, so it may only ever be cast at its delivery's base cost. */
  get hasFixedCost(): boolean {
    return !!this.spell?.noUpcast
  }

  /** True when the spell may be upcast, but never so far that it costs more than its delivery's base cost. */
  get hasManaCap(): boolean {
    return !!this.spell?.noManaBoost
  }

  /**
   * The most a capped spell may cost: its delivery's base cost (plus the spell's own base cost when it deals
   * damage), before discounts. Never below what the base setup costs, so a penalty can't make a spell uncastable.
   */
  protected get manaCap(): number {
    if (!this.hasManaCap) return Infinity
    const probe = this.asBaseProbe()
    probe.applyEffect = false
    probe.calculateManaCost()
    const base =
      this.baseManaCost +
      (probe.damageDice > 0 ? (this.spell?.baseManaCost ?? 0) : 0)
    return Math.max(base, probe.manaCost)
  }

  /** True when a capped spell currently costs more than it may. */
  get exceedsManaCap(): boolean {
    return this.hasManaCap && this.manaCost > this.manaCap
  }

  /** Puts every upcast setting back to its base. Subclasses reset their own sizes and targets. */
  protected resetToBase() {
    this.upcast = 0
    this.damageDice = Math.min(1, this.damageDice)
  }

  /** A copy of this delivery cast at its base setup, for working out what the base costs. */
  protected asBaseProbe(): this {
    const probe = this.clone()
    probe.resetToBase()
    return probe
  }

  /** Steps the settings down, one upcast at a time, until a capped spell fits its cap. Subclasses do their own. */
  protected enforceManaCap() {
    if (!this.hasManaCap) return
    const over = () => (this.calculateManaCost(), this.exceedsManaCap)
    while (over() && this.upcast > 0) this.upcast--
    if (over() && this.applyEffect && this.damageDice > 0)
      this.applyEffect = false
    while (over() && this.damageDice > 1) this.damageDice--
    this.calculateManaCost()
  }

  /**
   * A fixed-cost spell is cast for its damage or for its effect, never both, as that is an upcast. Spells that
   * don't charge for the extra effect, and effect-only spells, have nothing to trade.
   */
  protected get tradesDamageForEffect(): boolean {
    return (
      this.hasFixedCost &&
      !this.spell.ignoreEffectCost &&
      this.spell.damageType !== "none"
    )
  }

  /** Brings a delivery that was configured for another spell back to its base cost. */
  protected enforceFixedCost() {
    if (!this.hasFixedCost) return
    this.resetToBase()
    if (this.tradesDamageForEffect && this.damageDice > 0)
      this.applyEffect = false
  }

  setDamageDice(dice: number) {
    if (this.spell?.damageType !== "none") {
      this.damageDice = this.hasFixedCost ? Math.min(1, dice) : dice
      if (this.tradesDamageForEffect) this.applyEffect = this.damageDice === 0
      this.calculateManaCost()
      this.enforceManaCap()
    }
  }

  setStudyDamageDice(dice: number) {
    if (this.spell?.damageType !== "none") {
      this.studyDamageDice = dice
    }
  }

  setUpcast(upcast: number) {
    this.upcast = this.hasFixedCost ? 0 : upcast
    this.calculateManaCost()
    this.enforceManaCap()
  }

  setApplyEffect(isApplied: boolean) {
    this.applyEffect = isApplied
    if (this.tradesDamageForEffect) this.damageDice = isApplied ? 0 : 1
    this.calculateManaCost()
    this.enforceManaCap()
  }

  setIsFocused(isFocused: boolean) {
    this.isFocused = isFocused
  }

  setMods(mods: DeliveryMods) {
    this.mods = mods
    this.calculateManaCost()
    this.enforceManaCap()
  }

  setDiscount(discount: number) {
    this.discount = discount
  }

  /**
   * Adds the spell's own discount to the ones from modifiers. A negative one is a penalty.
   */
  protected applySpellManaDiscount() {
    this.discount += this.spell?.manaDiscount ?? 0
  }

  /**
   * The delivery-specific discounts (the casting modifiers' per-delivery ones, plus the spell's own) come off what
   * the Delivery itself costs, and nothing more: not the spell's own base cost, extra damage dice or the Effect
   * surcharge. `deliveryCost` is what the Delivery charges, and `alreadyApplied` what other delivery discounts
   * (such as the upcast ones) have already taken off it. A negative total is a penalty and is applied as is.
   */
  protected applyDeliveryDiscounts(deliveryCost: number, alreadyApplied = 0) {
    const total =
      (this.mods.deliveryDiscounts?.[this.constructor.name.toLowerCase()] ??
        0) + (this.spell?.deliveryDiscount ?? 0)
    if (total <= 0) {
      this.discount += total
      return
    }
    this.discount += Math.min(total, Math.max(0, deliveryCost - alreadyApplied))
  }

  applyEffectManaCost() {
    this._manaCost += this.upcast
    this._manaCost +=
      this.applyEffect &&
      this.damageDice > 0 &&
      this.spell?.damageType !== "none" &&
      !this.spell?.ignoreEffectCost
        ? 1
        : 0
  }

  toJson(): SpellDeliverySnapshot {
    return {
      name: this.name,
      applyEffect: this.applyEffect,
      isFocused: this.isFocused,
      ...(this.area && { area: this.area }),
      damageDice: this.damageDice,
      isArea: this instanceof AreaOfEffectDelivery,
      ...(this instanceof AreaOfEffectDelivery && { size: this.size }),
      ...(this instanceof Line && { width: this.width, height: this.height }),
      upcast: this.upcast,
      discount: this.discount,
      _manaCost: this._manaCost,
      spell: this.spell,
      mods: this.mods,
    }
  }

  static getSpellSnapshot(
    spell: Item & { system: SpellDataModel },
    flags?: Record<string, any>,
  ): SpellSnapshot {
    const modifier = (name: string) =>
      flags?.[`modifiers.spell.${name}`] ?? flags?.modifiers?.spell?.[name]
    const manaDiscount = Number(modifier("manaDiscount"))
    // A flag set to true (or any positive amount) grants that much; true counts as 1.
    const deliveryDiscount = Number(modifier("deliveryDiscount"))
    const noUpcast = !!modifier("noUpcast")
    const noManaBoost = !!modifier("noManaBoost")
    return {
      uuid: spell.uuid,
      name: spell.name,
      img: spell.img ?? "",
      description: spell.system.description,
      damageType: spell.system.damageType,
      baseManaCost: spell.system.baseManaCost,
      ignoreEffectCost: spell.system.ignoreEffectCost,
      appliedEffects: spell.system.appliedEffects as any[],
      appliedActiveEffects: spell.system.appliedActiveEffects as any[],
      emitsLight: spell.system.emitsLight as EmitsLight,
      upcastableEffect: spell.system.upcastableEffect,
      upcastableEffectDieRoll: spell.system.upcastableEffectDieRoll,
      focusExempt: spell.system.focusExempt,
      upkeep: spell.system.upkeep as SpellSnapshot["upkeep"],
      autoTargetingPref: spell.system.autoTargetingPref,
      ...(manaDiscount && { manaDiscount }),
      ...(deliveryDiscount && { deliveryDiscount }),
      ...(noUpcast && { noUpcast }),
      ...(noManaBoost && { noManaBoost }),
      ...(spell.system.surface?.enabled && {
        surface: JSON.parse(JSON.stringify(spell.system.surface)),
      }),
    }
  }

}

export abstract class AreaOfEffectDelivery extends SpellDelivery {

  override baseManaCost = 2
  baseSize = 0
  size = 0
  increment = 5

  private spellManaBase = 0
  private damageCost = 0
  protected deliveryUpcastCost = 0

  setSize(size: number) {
    this.size = this.hasFixedCost
      ? this.baseSize
      : Math.max(this.baseSize, size)
    this.calculateManaCost()
    this.enforceManaCap()
  }

  protected override resetToBase() {
    super.resetToBase()
    this.size = this.baseSize
  }

  protected override enforceManaCap() {
    super.enforceManaCap()
    if (!this.hasManaCap) return
    while (this.exceedsManaCap && this.size > this.baseSize) {
      this.size = Math.max(this.baseSize, this.size - this.increment)
      this.calculateManaCost()
    }
  }

  protected calculateBaseManaCost() {
    this.discount = 0
    this.spellManaBase =
      this.damageDice > 0 ? (this.spell?.baseManaCost ?? 0) : 0
    this.deliveryUpcastCost = (this.size - this.baseSize) / 5
    this.damageCost = Math.max(0, Math.max(0, this.damageDice - 1))
    this._manaCost =
      this.baseManaCost +
      this.spellManaBase +
      this.deliveryUpcastCost +
      this.damageCost
  }

  override calculateManaCost() {
    this.calculateBaseManaCost()
    let upcastDiscounted = 0
    if (this.size > this.baseSize) {
      upcastDiscounted = Math.min(
        this.deliveryUpcastCost,
        this.mods.deliveryUpcastDiscount,
      )
      this.discount += upcastDiscounted
    }
    if (this.damageDice > 1) {
      this.discount += Math.min(
        this.deliveryUpcastCost,
        this.mods.damageUpcastDiscount,
      )
    }

    this.applyDeliveryDiscounts(
      this.baseManaCost + this.deliveryUpcastCost,
      upcastDiscounted,
    )

    this.applySpellManaDiscount()
    super.applyEffectManaCost()
  }

}
export type AuraCenter = "self" | "familiar"

export class Aura extends AreaOfEffectDelivery {

  override name = appLang.SpellDeliveries.aura.name
  override description = appLang.SpellDeliveries.aura.description
  override targetLabel = appLang.SpellDeliveries.aura.targetLabel
  override baseSize: number = 10
  override baseManaCost: number = 2
  center: AuraCenter = "self"

  setCenter(center: AuraCenter) {
    this.center = center
  }

}
export class Cone extends AreaOfEffectDelivery {

  override name = appLang.SpellDeliveries.cone.name
  override description = appLang.SpellDeliveries.cone.description
  override targetLabel = appLang.SpellDeliveries.cone.targetLabel
  override baseSize: number = 15
  override baseManaCost: number = 2

}
export class Line extends AreaOfEffectDelivery {

  override name = appLang.SpellDeliveries.line.name
  override description = appLang.SpellDeliveries.line.description
  override targetLabel = appLang.SpellDeliveries.line.targetLabel
  override baseManaCost: number = 2
  override increment = 10
  baseSize: number = 30
  baseHeight: number = 10
  baseWidth: number = 5
  height: number = 10
  width: number = 5

  setHeight(h: number) {
    this.height = this.hasFixedCost
      ? this.baseHeight
      : Math.max(this.baseHeight, h)
    this.calculateManaCost()
    this.enforceManaCap()
  }

  setWidth(w: number) {
    this.width = this.hasFixedCost
      ? this.baseWidth
      : Math.max(this.baseWidth, w)
    this.calculateManaCost()
    this.enforceManaCap()
  }

  protected override resetToBase() {
    super.resetToBase()
    this.height = this.baseHeight
    this.width = this.baseWidth
  }

  protected override enforceManaCap() {
    super.enforceManaCap()
    if (!this.hasManaCap) return
    while (this.exceedsManaCap && this.height > this.baseHeight) {
      this.height = Math.max(this.baseHeight, this.height - this.baseHeight)
      this.calculateManaCost()
    }
    while (this.exceedsManaCap && this.width > this.baseWidth) {
      this.width = Math.max(this.baseWidth, this.width - this.baseWidth)
      this.calculateManaCost()
    }
  }

  override calculateManaCost() {
    super.calculateBaseManaCost()

    // Track the delivery upcast discount and "expend" it as the calculations are done...
    let dud = this.mods.deliveryUpcastDiscount
    let upcastDiscounted = 0
    if (dud > 0) {
      upcastDiscounted = Math.min(this.deliveryUpcastCost, dud)
      this.discount += upcastDiscounted
      dud -= this.deliveryUpcastCost
    }

    const isLineExpanded =
      this.height > this.baseHeight || this.width > this.baseWidth
    let lineDeliveryCost = this.baseManaCost + this.deliveryUpcastCost
    if (isLineExpanded) {
      const expansionSteps =
        (this.height - this.baseHeight) / this.baseHeight +
        (this.width - this.baseWidth) / this.baseWidth

      const deliveryCost =
        (this.baseManaCost + this.deliveryUpcastCost) * 2 ** expansionSteps
      lineDeliveryCost = deliveryCost

      const damageUpcastCost = this.damageDice - 1

      this._manaCost = deliveryCost + damageUpcastCost
    }

    if (dud > 0 && dud < this.deliveryUpcastCost - this.baseManaCost) {
      this._manaCost -= Math.min(this.deliveryUpcastCost, dud)
    }

    this.applyDeliveryDiscounts(lineDeliveryCost, upcastDiscounted)
    this.applySpellManaDiscount()
    super.applyEffectManaCost()
  }

}
export class Sphere extends AreaOfEffectDelivery {

  override name = appLang.SpellDeliveries.sphere.name
  override description = appLang.SpellDeliveries.sphere.description
  override targetLabel = appLang.SpellDeliveries.sphere.targetLabel
  override baseManaCost: number = 2
  baseSize: number = 5

}

export abstract class PerTargetDelivery extends SpellDelivery {

  override baseManaCost = 0
  extraTargetMultiplier = 1
  targetLimit = 0
  targetCount: number = 1
  targetTokenIds: string[] = []

  setTargetCount(count: number) {
    if (this instanceof Cube || this instanceof Glyph) {
      this.targetCount = this.hasFixedCost ? Math.min(1, count) : count
      this.calculateManaCost()
      this.enforceManaCap()
    }
  }

  setTargetTokenIds(targetTokenIds: string[]) {
    this.targetTokenIds = targetTokenIds
    this.targetCount = this.hasFixedCost
      ? Math.min(1, targetTokenIds.length)
      : targetTokenIds.length
    this.calculateManaCost()
    this.enforceManaCap()
  }

  /** A fixed-cost spell is cast on one target, so more than one targeted token can't be cast on. */
  get hasExtraTargets(): boolean {
    return (
      this.hasFixedCost &&
      !(this instanceof Cube || this instanceof Glyph) &&
      this.targetTokenIds.length > 1
    )
  }

  /** The most Cubes or Glyph squares the spell can place, or undefined when it is not limited. */
  get maxTargetCount(): number | undefined {
    if (this.hasFixedCost) return 1
    if (!this.hasManaCap) return undefined
    const cap = this.manaCap
    const probe = this.clone()
    let fits = 1
    for (let count = 2; count <= 50; count++) {
      probe.targetCount = count
      probe.calculateManaCost()
      if (probe.manaCost > cap) break
      fits = count
    }
    return fits
  }

  protected override resetToBase() {
    super.resetToBase()
    this.targetCount = Math.min(1, this.targetCount)
  }

  protected override asBaseProbe() {
    const probe = super.asBaseProbe()
    probe.targetTokenIds = probe.targetTokenIds.slice(0, 1)
    return probe
  }

  protected override enforceManaCap() {
    super.enforceManaCap()
    if (!this.hasManaCap) return
    while (this.exceedsManaCap && this.targetCount > 1) {
      this.targetCount--
      this.calculateManaCost()
    }
  }

  override calculateManaCost() {
    this.discount = 0
    let targets: number
    if (
      this instanceof Remote ||
      this instanceof Imbue ||
      this instanceof Touch
    ) {
      targets = Math.max(1, this.targetTokenIds.length)
    }
    else {
      targets = Math.max(1, this.targetCount)
    }
    if (this.hasFixedCost) targets = 1

    let upcastDiscounted = 0
    if (targets > 1) {
      // The upcast discount can only take off what the extra targets cost, never the rest of the cast.
      upcastDiscounted = Math.min(
        (targets - 1) * this.extraTargetMultiplier,
        this.mods.deliveryUpcastDiscount,
      )
      this.discount += upcastDiscounted
    }

    const deliveryCost =
      Math.max(0, targets - 1) * this.extraTargetMultiplier + this.baseManaCost
    this.applyDeliveryDiscounts(deliveryCost, upcastDiscounted)

    this._manaCost =
      deliveryCost +
      (this.damageDice > 0 ? (this.spell?.baseManaCost ?? 0) : 0) +
      Math.max(0, this.damageDice - 1)

    this.applySpellManaDiscount()
    super.applyEffectManaCost()
  }

}
export class Cube extends PerTargetDelivery {

  override name = appLang.SpellDeliveries.cube.name
  override description = appLang.SpellDeliveries.cube.description
  override targetLabel = appLang.SpellDeliveries.cube.targetLabel
  override baseManaCost: number = 1

}
export class Imbue extends PerTargetDelivery {

  override name = appLang.SpellDeliveries.imbue.name
  override description = appLang.SpellDeliveries.imbue.description
  override targetLabel = appLang.SpellDeliveries.imbue.targetLabel
  override baseManaCost = 1

}
export class Glyph extends PerTargetDelivery {

  override name = appLang.SpellDeliveries.glyph.name
  override description = appLang.SpellDeliveries.glyph.description
  override targetLabel = appLang.SpellDeliveries.glyph.targetLabel
  override baseManaCost: number = 2
  override targetLimit: number = 1

  /**
   * Placing a Glyph only pays for the Glyph. Whether to Focus, to cast for effect and how many damage dice to roll
   * are chosen later, when the Glyph is triggered (as a Cube).
   */
  override setDamageDice(dice: number) {
    super.setDamageDice(Math.min(1, dice))
  }

  override setApplyEffect(_isApplied: boolean) {
    super.setApplyEffect(false)
  }

  override setIsFocused(_isFocused: boolean) {
    super.setIsFocused(false)
  }

}
export class Remote extends PerTargetDelivery {

  override name = appLang.SpellDeliveries.remote.name
  override description = appLang.SpellDeliveries.remote.description
  override targetLabel = appLang.SpellDeliveries.remote.targetLabel
  override targetLimit: number = 0

}
export class Touch extends PerTargetDelivery {

  override name = appLang.SpellDeliveries.touch.name
  override description = appLang.SpellDeliveries.touch.description
  override targetLabel = appLang.SpellDeliveries.touch.targetLabel
  override targetLimit: number = 1

}

export const getNewDeliveryOptions = (
  spell: SpellSnapshot,
  mods: DeliveryMods,
): SpellDelivery[] => {
  const deliveries = [
    new Aura(spell, mods),
    new Cone(spell, mods),
    new Cube(spell, mods),
    new Glyph(spell, mods),
    new Imbue(spell, mods),
    new Line(spell, mods),
    new Remote(spell, mods),
    new Sphere(spell, mods),
    new Touch(spell, mods),
  ].sort((a, b) => a.name.localeCompare(b.name))

  deliveries.forEach((d) => {
    if (d instanceof AreaOfEffectDelivery) {
      d.setSize(d.baseSize)
    }
    if (d instanceof PerTargetDelivery) {
      d.setTargetTokenIds(
        Array.from(game.user?.targets ?? []).map((it) => it.id),
      )
    }
  })
  return deliveries
}

export const getDeliveryDropdownOptions = (deliveries: SpellDelivery[]) => {
  return deliveries.map((d, index) => ({ label: d.name, value: index }))
}
