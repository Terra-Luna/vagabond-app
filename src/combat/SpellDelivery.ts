abstract class SpellDelivery {
    abstract baseManaCost: number
    abstract calculateCastCost(): number
    isDmgOrEffOnly: boolean = true
}

abstract class AreaOfEffectDelivery extends SpellDelivery {
    override baseManaCost = 2
    baseSize: number = 0
    size: number = this.baseSize
    
    constructor(size: number) {
        super()
        this.size = size
    }

    override calculateCastCost(): number {
        const cost = this.baseManaCost + ((this.size - this.baseSize) / 5)
        return this.isDmgOrEffOnly ? cost : cost + 1
    }
}
export class Aura extends AreaOfEffectDelivery {
    override baseSize: number = 10
    override size: number = this.baseSize
}
export class Cone extends AreaOfEffectDelivery {
    override baseSize: number = 15
    override size: number = this.baseSize
}
export class Line extends AreaOfEffectDelivery {
    baseSize: number = 30
}
export class Sphere extends AreaOfEffectDelivery {
    baseSize: number = 5
}

abstract class SingleTargetDelivery extends SpellDelivery {
    override baseManaCost: number = 0
    abstract targets: number
}
