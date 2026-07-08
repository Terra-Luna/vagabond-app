import { vgLiteLang } from "../../utils/lang"
import { getTargets } from "../../utils/modelUtil"

/**
 * Use the available update functions for each delivery type
 * to have manaCost automatically updated.
 */
export abstract class SpellDelivery {
    abstract name: string
    abstract description: string
    abstract targetLabel: string
    abstract baseManaCost: number

    clone() {
        const Ctor = this.constructor as new () => this
        const updatedDelivery = new Ctor()
        Object.assign(updatedDelivery, this)
        return updatedDelivery
    }

    applyEffect = false
    isFocused = false
    damageDice = 1
    manaCost = 0
    targetCount: number = 1
    targetTokens: Token[] = []

    abstract calculateManaCost()

    applyEffectManaCost() {
        if (this.applyEffect && this.damageDice > 0) {
            this.manaCost += 1
        }
    }
}

export abstract class AreaOfEffectDelivery extends SpellDelivery {
    override baseManaCost = 2
    baseSize = 0
    size = 0

    protected calculateBaseManaCost() {
        this.manaCost = this.baseManaCost + ((this.size - this.baseSize) / 5) + (Math.max(0, this.damageDice - 1))
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

    override calculateManaCost() {
        super.calculateBaseManaCost()
        if (this.height > 10 || this.width > 5) {
            const heightMultiplier = (this.height - this.baseHeight) / this.baseHeight
            const widthMultiplier = (this.width - this.baseWidth) / this.baseWidth
            for (let i = 0; i < heightMultiplier; i++) { this.manaCost *= 2 }
            for (let i = 0; i < widthMultiplier; i++) { this.manaCost *= 2 }
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

    override calculateManaCost() {
        let targets: number
        if (this instanceof Remote || this instanceof Imbue) {
            targets = Math.max(1, this.targetTokens.length)
        }
        else {
            targets = Math.max(1, this.targetCount)
        }
        this.manaCost = ((targets - 1) * this.extraTargetMultiplier) + this.baseManaCost + (Math.max(0, this.damageDice - 1))
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
    override extraTargetMultiplier: number = 2
}
export class ImbueDelivery extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.imbuedeliv.name
    override description = vgLiteLang.SpellDeliveries.imbuedeliv.description
    override targetLabel = vgLiteLang.SpellDeliveries.imbuedeliv.targetLabel
    override targetLimit: number = 1
    override baseManaCost: number = 1
}
export class Glyph extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.glyph.name
    override description = vgLiteLang.SpellDeliveries.glyph.description
    override targetLabel = vgLiteLang.SpellDeliveries.glyph.targetLabel
    override baseManaCost: number = 2
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

export const getNewDeliveryOptions = (): SpellDelivery[] => {
    const deliveries = [
        new Aura(), new Cone(), new Cube(), new Glyph(),
        new Imbue(), new ImbueDelivery(), new Line(),
        new Remote(), new Sphere(), new Touch()
    ].sort((a, b) => a.name.localeCompare(b.name))

    deliveries.forEach(d => {
        d.targetTokens = Array.from(game.user?.targets ?? [])
        d.targetCount = Math.max(1, d.targetTokens.length)
        if (d instanceof AreaOfEffectDelivery) {
            d.size = d.baseSize
        }
        d.calculateManaCost()
    })
    return deliveries
}

export const getDeliveryDropdownOptions = (deliveries: SpellDelivery[]) => {
    return deliveries.map((d, index) => ({ label: d.name, value: index }))
}