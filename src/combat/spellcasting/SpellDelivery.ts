import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { vgLiteLang } from "../../utils/lang"

export interface SpellDeliverySnapshot {
    name: string,
    applyEffect: boolean,
    isFocused: boolean,
    manaCost: number,
    spell: SpellSnapshot,
    mods: DeliveryMods
}

export interface SpellSnapshot {
    uuid: string,
    name: string,
    damageType: string,
    baseManaCost: number,
    ignoreEffectCost: boolean,
    appliedEffects: { effect: string, duration: string | unknown, critDuration: string | unknown }[]
}

export interface DeliveryMods {
    damageUpcastDiscount: number,
    deliveryUpcastDiscount: number,
    deliveryDiscounts?: {
        aura?: number,
        cone?: number,
        line?: number,
        sphere?: number
    }
}

/**
 * Use the available update functions for each delivery type
 * to have manaCost automatically updated.
 */
export abstract class SpellDelivery {

    abstract name: string
    abstract description: string
    abstract targetLabel: string
    abstract baseManaCost: number

    applyEffect = false
    isFocused = false
    damageDice = 1
    manaCost = 0
    discount = false

    spell: SpellSnapshot
    mods: DeliveryMods

    constructor(spell: SpellSnapshot, mods: DeliveryMods) {
        this.spell = spell
        this.mods = mods
    }

    clone() {
        const Ctor = this.constructor as new (spell: SpellSnapshot, mods: DeliveryMods) => this
        const clone = new Ctor(this.spell, this.mods)
        Object.assign(clone, this)
        return clone
    }

    abstract calculateManaCost()

    setSpell(spell) {
        this.spell = spell
        if (spell.damageType === 'none') {
            this.damageDice = 0
        }
        this.calculateManaCost()
    }

    setDamageDice(dice: number) {
        if (this.spell?.damageType !== 'none') {
            this.damageDice = dice
            this.calculateManaCost()
        }
    }

    setApplyEffect(isApplied: boolean) {
        this.applyEffect = isApplied
        this.calculateManaCost()
    }

    setIsFocused(isFocused: boolean) {
        this.isFocused = isFocused
    }

    setDiscount(discount: boolean) {
        this.discount = discount
        this.calculateManaCost()
    }

    applyEffectManaCost() {
        this.manaCost += this.applyEffect && this.damageDice > 0 && !this.spell?.ignoreEffectCost
            ? 1
            : 0
        this.manaCost -= this.discount
            ? 1
            : 0
    }

    toJson(): SpellDeliverySnapshot {
        return {
            name: this.name,
            applyEffect: this.applyEffect,
            isFocused: this.isFocused,
            manaCost: this.manaCost,
            spell: this.spell,
            mods: this.mods
        }
    }

    static getSpellSnapshot(spell: Item & { system: SpellDataModel }): SpellSnapshot {
        return {
            uuid: spell.uuid,
            name: spell.name,
            damageType: spell.system.damageType,
            baseManaCost: spell.system.baseManaCost,
            ignoreEffectCost: spell.system.ignoreEffectCost,
            appliedEffects: spell.system.appliedEffects
        }
    }
}

export abstract class AreaOfEffectDelivery extends SpellDelivery {
    override baseManaCost = 2
    baseSize = 0
    size = 0

    private spellManaBase = 0
    private damageCost = 0
    protected deliveryUpcastCost = 0

    setSize(size: number) {
        this.size = Math.max(this.baseSize, size)
        this.calculateManaCost()
    }

    protected calculateBaseManaCost() {
        this.spellManaBase = (this.damageDice > 0 ? (this.spell?.baseManaCost ?? 0) : 0)
        this.deliveryUpcastCost = ((this.size - this.baseSize) / 5)
        this.damageCost = Math.max(0, (Math.max(0, (this.damageDice - 1))) - this.mods.damageUpcastDiscount)
        this.manaCost = this.baseManaCost
            + this.spellManaBase
            + this.deliveryUpcastCost
            + this.damageCost
    }

    override calculateManaCost() {
        this.calculateBaseManaCost()
        if (this.size > this.baseSize) {
            this.manaCost -= Math.min(this.deliveryUpcastCost, this.mods.deliveryUpcastDiscount)
        }
        super.applyEffectManaCost()
    }
}
export class Aura extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.aura.name
    override description = vgLiteLang.SpellDeliveries.aura.description
    override targetLabel = vgLiteLang.SpellDeliveries.aura.targetLabel
    override baseSize: number = 10
    override baseManaCost: number = Math.max(
        0, 2 - (this.mods.deliveryDiscounts?.aura ?? 0)
    )
}
export class Cone extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.cone.name
    override description = vgLiteLang.SpellDeliveries.cone.description
    override targetLabel = vgLiteLang.SpellDeliveries.cone.targetLabel
    override baseSize: number = 15
    override baseManaCost: number = Math.max(
        0, 2 - (this.mods.deliveryDiscounts?.cone ?? 0)
    )
}
export class Line extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.line.name
    override description = vgLiteLang.SpellDeliveries.line.description
    override targetLabel = vgLiteLang.SpellDeliveries.line.targetLabel
    override baseManaCost: number = Math.max(
        0, 2 - (this.mods.deliveryDiscounts?.line ?? 0)
    )
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
        let discount = this.mods.deliveryUpcastDiscount
        if (discount > 0) {
            this.manaCost -= Math.min(this.deliveryUpcastCost, discount)
            discount -= this.deliveryUpcastCost
        }

        const isLineExpanded = this.height > this.baseHeight || this.width > this.baseWidth
        if (isLineExpanded) {
            const heightMultiplier = (this.height - this.baseHeight) / this.baseHeight
            const widthMultiplier = (this.width - this.baseWidth) / this.baseWidth
            const mana = this.manaCost
            for (let i = 0; i < heightMultiplier; i++) {
                this.deliveryUpcastCost += mana
                this.manaCost += mana
            }
            for (let i = 0; i < widthMultiplier; i++) {
                this.deliveryUpcastCost += mana
                this.manaCost += mana
            }
        }

        if (discount > 0 && discount < this.deliveryUpcastCost - this.baseManaCost) {
            this.manaCost -= Math.min(this.deliveryUpcastCost, discount)
        }

        super.applyEffectManaCost()
    }
}
export class Sphere extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.sphere.name
    override description = vgLiteLang.SpellDeliveries.sphere.description
    override targetLabel = vgLiteLang.SpellDeliveries.sphere.targetLabel
    override baseManaCost: number = Math.max(
        0, 2 - (this.mods.deliveryDiscounts?.sphere ?? 0)
    )
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
        let targets: number
        if (this instanceof Remote || this instanceof Imbue || this instanceof Touch) {
            targets = Math.max(1, this.targetTokenIds.length)
        }
        else {
            targets = Math.max(1, this.targetCount)
        }

        targets -= Math.min(targets, this.mods.deliveryUpcastDiscount)
        this.manaCost = ((Math.max(0, targets - 1)) * this.extraTargetMultiplier)
            + this.baseManaCost
            + (this.damageDice > 0 ? (this.spell?.baseManaCost ?? 0) : 0)
            + (Math.max(0, this.damageDice - 1))

        super.applyEffectManaCost()
    }
}
export class Cube extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.cube.name
    override description = vgLiteLang.SpellDeliveries.cube.description
    override targetLabel = vgLiteLang.SpellDeliveries.cube.targetLabel
    override baseManaCost: number = 1
}
export class Imbue extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.imbue.name
    override description = vgLiteLang.SpellDeliveries.imbue.description
    override targetLabel = vgLiteLang.SpellDeliveries.imbue.targetLabel
    override baseManaCost: number = 1
}
export class Glyph extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.glyph.name
    override description = vgLiteLang.SpellDeliveries.glyph.description
    override targetLabel = vgLiteLang.SpellDeliveries.glyph.targetLabel
    override baseManaCost: number = 2
    override targetLimit: number = 1
}
export class Remote extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.remote.name
    override description = vgLiteLang.SpellDeliveries.remote.description
    override targetLabel = vgLiteLang.SpellDeliveries.remote.targetLabel
    override targetLimit: number = 0
}
export class Touch extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.touch.name
    override description = vgLiteLang.SpellDeliveries.touch.description
    override targetLabel = vgLiteLang.SpellDeliveries.touch.targetLabel
    override targetLimit: number = 1
}

export const getNewDeliveryOptions = (spell: SpellSnapshot, mods: DeliveryMods): SpellDelivery[] => {
    const deliveries = [
        new Aura(spell, mods), new Cone(spell, mods), new Cube(spell, mods),
        new Glyph(spell, mods), new Imbue(spell, mods), new Line(spell, mods),
        new Remote(spell, mods), new Sphere(spell, mods), new Touch(spell, mods)
    ].sort((a, b) => a.name.localeCompare(b.name))

    deliveries.forEach(d => {
        if (d instanceof AreaOfEffectDelivery) {
            d.setSize(d.baseSize)
        }
        if (d instanceof PerTargetDelivery) {
            d.setTargetTokenIds(Array.from(game.user?.targets ?? []).map(it => it.id))
        }
    })
    return deliveries
}

export const getDeliveryDropdownOptions = (deliveries: SpellDelivery[]) => {
    return deliveries.map((d, index) => ({ label: d.name, value: index }))
}