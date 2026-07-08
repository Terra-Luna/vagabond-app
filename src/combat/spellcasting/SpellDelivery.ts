import { vgLiteLang } from "../../utils/lang"
import { getTargets } from "../../utils/modelUtil"

/**
 * Use the available update functions for each delivery type
 * to have manaCost automatically updated.
 */
export abstract class SpellDelivery {
    abstract name: string
    abstract description: string
    abstract baseManaCost: number

    applyEffect = false
    damageDice = 1
    manaCost = 0

    abstract updateCastData()
}

export abstract class AreaOfEffectDelivery extends SpellDelivery {
    override baseManaCost = 2
    baseSize = 0
    size = 0

    override updateCastData() {
        this.manaCost = this.baseManaCost + ((this.size - this.baseSize) / 5) + (this.damageDice - 1)
        if (this.applyEffect && this.damageDice > 0) {
            this.manaCost += 1
        }
    }
}
export class Aura extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.aura.name
    override description = vgLiteLang.SpellDeliveries.aura.description
    override baseSize: number = 10
}
export class Cone extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.cone.name
    override description = vgLiteLang.SpellDeliveries.cone.description
    override baseSize: number = 15
}
export class Line extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.line.name
    override description = vgLiteLang.SpellDeliveries.line.description
    baseSize: number = 30
    isExtended: boolean = false

    override updateCastData() {
        super.updateCastData()
        if (this.isExtended) {
            this.manaCost *= 2
        }
    }
}
export class Sphere extends AreaOfEffectDelivery {
    override name = vgLiteLang.SpellDeliveries.sphere.name
    override description = vgLiteLang.SpellDeliveries.sphere.description
    baseSize: number = 5
}

export abstract class PerTargetDelivery extends SpellDelivery {
    override baseManaCost = 0
    targets: number = 1
    extraTargetMultiplier = 1
    targetLimit = 0

    override updateCastData() {
        this.manaCost = ((this.targets - 1) * this.extraTargetMultiplier) + this.baseManaCost + (Math.max(0, this.damageDice - 1))
        if (this.applyEffect && this.damageDice > 0) {
            this.manaCost += 1
        }
    }
}
export class Cube extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.cube.name
    override description = vgLiteLang.SpellDeliveries.cube.description
    override baseManaCost: number = 1
}
export class Imbue extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.imbue.name
    override description = vgLiteLang.SpellDeliveries.imbue.description
    override extraTargetMultiplier: number = 2
}
export class ImbueDelivery extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.imbuedeliv.name
    override description = vgLiteLang.SpellDeliveries.imbuedeliv.description
    override targetLimit: number = 1
    override baseManaCost: number = 1
}
export class Glyph extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.glyph.name
    override description = vgLiteLang.SpellDeliveries.glyph.description
    override baseManaCost: number = 2
}
export class Remote extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.remote.name
    override description = vgLiteLang.SpellDeliveries.remote.description
    override targetLimit: number = 0
}
export class Touch extends PerTargetDelivery {
    override name = vgLiteLang.SpellDeliveries.touch.name
    override description = vgLiteLang.SpellDeliveries.touch.description
    override targetLimit: number = 1
}

export const getNewDeliveryOptions = (): SpellDelivery[] => {
    const deliveries = [
        new Aura(), new Cone(), new Cube(), new Glyph(),
        new Imbue(), new ImbueDelivery(), new Line(),
        new Remote(), new Sphere(), new Touch()
    ].sort((a, b) => a.name.localeCompare(b.name))

    console.log("Getting new deliveyr options...")

    const targets = getTargets().length || 1
    deliveries.filter(d => d instanceof AreaOfEffectDelivery).forEach(d => {
        d.size = d.baseSize
        d.updateCastData()
    })
    deliveries.filter(d => d instanceof PerTargetDelivery).forEach(d => {
        d.targets = targets
        d.updateCastData()
    })
    return deliveries
}

export const getDeliveryDropdownOptions = (deliveries: SpellDelivery[]) => {
    return deliveries.map((d, index) => ({ label: d.name, value: index }))
}