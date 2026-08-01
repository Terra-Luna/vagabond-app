import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { vgLiteLang } from "../../utils/lang"

export interface SpellDeliverySnapshot {
    name: string,
    applyEffect: boolean,
    isFocused: boolean,
    manaCost: number,
    spell: SpellSnapshot
}

export interface SpellSnapshot {
    uuid: string,
    name: string,
    damageType: string,
    baseManaCost: number,
    ignoreEffectCost: boolean,
    appliedEffects: { effect: string, duration: string }[]
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

    spell: SpellSnapshot

    constructor(spell: SpellSnapshot) {
        this.spell = spell
    }

    clone() {
        const Ctor = this.constructor as new () => this
        const clone = new Ctor()
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
        if (this.spell.damageType !== 'none') {
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

    applyEffectManaCost() {
        if (this.applyEffect && this.damageDice > 0 && !this.spell.ignoreEffectCost) {
            this.manaCost += 1
        }
    }

    toJson(): SpellDeliverySnapshot {
        return {
            name: this.name,
            applyEffect: this.applyEffect,
            isFocused: this.isFocused,
            manaCost: this.manaCost,
            spell: this.spell
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

    setSize(size: number) {
        this.size = Math.max(this.baseSize, size)
        this.calculateBaseManaCost()
    }

    protected calculateBaseManaCost() {
        this.manaCost = this.baseManaCost
            + (this.damageDice > 0 ? this.spell?.baseManaCost : 0)
            + ((this.size - this.baseSize) / 5)
            + (Math.max(0, (this.damageDice - 1)))
    }

    override calculateManaCost() {
        this.calculateBaseManaCost()
        super.applyEffectManaCost()
    }
}
export class Aura extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.aura.name
    override description = vgLiteLang.SpellDeliveries.aura.description
    override targetLabel = vgLiteLang.SpellDeliveries.aura.targetLabel
    override baseSize: number = 10
}
export class Cone extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.cone.name
    override description = vgLiteLang.SpellDeliveries.cone.description
    override targetLabel = vgLiteLang.SpellDeliveries.cone.targetLabel
    override baseSize: number = 15
}
export class Line extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.line.name
    override description = vgLiteLang.SpellDeliveries.line.description
    override targetLabel = vgLiteLang.SpellDeliveries.line.targetLabel
    baseSize: number = 30
    baseHeight: number = 10
    baseWidth: number = 5
    height: number = 10
    width: number = 5

    setHeight(h: number) {
        this.height = h
        this.calculateBaseManaCost()
    }

    setWidth(w: number) {
        this.width = w
        this.calculateBaseManaCost()
    }

    override calculateManaCost() {
        super.calculateBaseManaCost()
        if (this.height > 10 || this.width > 5) {
            const mana = this.manaCost
            const heightMultiplier = (this.height - this.baseHeight) / this.baseHeight
            const widthMultiplier = (this.width - this.baseWidth) / this.baseWidth
            for (let i = 0; i < heightMultiplier; i++) { this.manaCost += mana }
            for (let i = 0; i < widthMultiplier; i++) { this.manaCost += mana }
        }
        super.applyEffectManaCost()
    }
}
export class Sphere extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.sphere.name
    override description = vgLiteLang.SpellDeliveries.sphere.description
    override targetLabel = vgLiteLang.SpellDeliveries.sphere.targetLabel
    baseSize: number = 5
}

export abstract class PerTargetDelivery extends SpellDelivery {
    override baseManaCost = 0
    extraTargetMultiplier = 1
    targetLimit = 0
    targetCount: number = 1
    targetTokenIds: string[] = []

    setTargetCount(count: number) {
        this.targetCount = count
        this.calculateManaCost()
    }

    setTargetTokenIds(targetTokenIds: string[]) {
        this.targetTokenIds = targetTokenIds
        this.targetCount = targetTokenIds.length
        this.calculateManaCost()
    }

    override calculateManaCost() {
        let targets: number
        if (this instanceof Remote || this instanceof Imbue) {
            targets = Math.max(1, this.targetTokenIds.length)
        }
        else {
            targets = Math.max(1, this.targetCount)
        }
        this.manaCost = ((targets - 1) * this.extraTargetMultiplier)
            + this.baseManaCost
            + (this.damageDice > 0 ? this.spell.baseManaCost : 0)
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

export const getNewDeliveryOptions = (spell: SpellSnapshot): SpellDelivery[] => {
    const deliveries = [
        new Aura(spell), new Cone(spell), new Cube(spell),
        new Glyph(spell), new Imbue(spell), new Line(spell),
        new Remote(spell), new Sphere(spell), new Touch(spell)
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