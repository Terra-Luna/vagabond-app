import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { appLang } from "../../util/lang"
import type { EmitsLight } from "../engine/util/active-effect-fx"

export interface PlacedArea {
  sceneId: string
  /** Centers of the grid squares the area covers. Empty for areas that follow the caster. */
  cells: { x: number; y: number }[]
  /** Set for Auras and Cones: the area is recomputed from the caster's token whenever it moves or turns. */
  follow?: { kind: "aura" | "cone"; size: number; actorId: string }
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
    this.calculateManaCost()
  }

  setDamageDice(dice: number) {
    if (this.spell?.damageType !== "none") {
      this.damageDice = dice
      this.calculateManaCost()
    }
  }

  setStudyDamageDice(dice: number) {
    if (this.spell?.damageType !== "none") {
      this.studyDamageDice = dice
    }
  }

  setUpcast(upcast: number) {
    this.upcast = upcast
    this.calculateManaCost()
  }

  setApplyEffect(isApplied: boolean) {
    this.applyEffect = isApplied
    this.calculateManaCost()
  }

  setIsFocused(isFocused: boolean) {
    this.isFocused = isFocused
  }

  setMods(mods: DeliveryMods) {
    this.mods = mods
    this.calculateManaCost()
  }

  setDiscount(discount: number) {
    this.discount = Math.max(0, discount)
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
  ): SpellSnapshot {
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
    this.size = Math.max(this.baseSize, size)
    this.calculateManaCost()
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
    if (this.size > this.baseSize) {
      this.discount += Math.min(
        this.deliveryUpcastCost,
        this.mods.deliveryUpcastDiscount,
      )
    }
    if (this.damageDice > 1) {
      this.discount += Math.min(
        this.deliveryUpcastCost,
        this.mods.damageUpcastDiscount,
      )
    }

    this.discount +=
      this.mods.deliveryDiscounts?.[this.constructor.name.toLowerCase()] ?? 0

    super.applyEffectManaCost()
  }

}
export class Aura extends AreaOfEffectDelivery {

  override name = appLang.SpellDeliveries.aura.name
  override description = appLang.SpellDeliveries.aura.description
  override targetLabel = appLang.SpellDeliveries.aura.targetLabel
  override baseSize: number = 10
  override baseManaCost: number = 2

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
    this.height = Math.max(this.baseHeight, h)
    this.calculateManaCost()
  }

  setWidth(w: number) {
    this.width = Math.max(this.baseWidth, w)
    this.calculateManaCost()
  }

  override calculateManaCost() {
    super.calculateBaseManaCost()

    // Track the delivery upcast discount and "expend" it as the calculations are done...
    let dud = this.mods.deliveryUpcastDiscount
    if (dud > 0) {
      this.discount += Math.min(this.deliveryUpcastCost, dud)
      dud -= this.deliveryUpcastCost
    }

    const isLineExpanded =
      this.height > this.baseHeight || this.width > this.baseWidth
    if (isLineExpanded) {
      const expansionSteps =
        (this.height - this.baseHeight) / this.baseHeight +
        (this.width - this.baseWidth) / this.baseWidth

      const deliveryCost =
        (this.baseManaCost + this.deliveryUpcastCost) * 2 ** expansionSteps

      const damageUpcastCost = this.damageDice - 1

      this._manaCost = deliveryCost + damageUpcastCost
    }

    if (dud > 0 && dud < this.deliveryUpcastCost - this.baseManaCost) {
      this._manaCost -= Math.min(this.deliveryUpcastCost, dud)
    }

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
      this.targetCount = count
      this.calculateManaCost()
    }
  }

  setTargetTokenIds(targetTokenIds: string[]) {
    this.targetTokenIds = targetTokenIds
    this.targetCount = targetTokenIds.length
    this.calculateManaCost()
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

    if (targets > 1) {
      this.discount += Math.min(targets, this.mods.deliveryUpcastDiscount)
    }

    this.discount +=
      this.mods.deliveryDiscounts?.[this.constructor.name.toLowerCase()] ?? 0

    this._manaCost =
      Math.max(0, targets - 1) * this.extraTargetMultiplier +
      this.baseManaCost +
      (this.damageDice > 0 ? (this.spell?.baseManaCost ?? 0) : 0) +
      Math.max(0, this.damageDice - 1)

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
