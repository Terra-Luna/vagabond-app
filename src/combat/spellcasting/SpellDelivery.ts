/**
 * Use the available update functions for each delivery type
 * to have manaCost automatically updated.
 */
abstract class SpellDelivery {
    abstract _baseManaCost: number
    _isDmgOrEffOnly = true
    _upcast = 0

    manaCost = 0
    damageDice = this._upcast + 1

    setUpcast(amt: number) {
        this._upcast = amt
        this._updateCastData()
    }
    setIsDmgOrEffOnly(isDmgOrEffOnly: boolean) {
        this._isDmgOrEffOnly = isDmgOrEffOnly
        this._updateCastData()
    }
    _updateCastData() {
        this.damageDice = this._upcast + 1
    }
}

abstract class AreaOfEffectDelivery extends SpellDelivery {
    override _baseManaCost = 2
    _baseSize = 0
    _size = 0
   
    setSize(size: number) {
        this._size = size
        this._updateCastData()
    }
    override _updateCastData() {
        const cost = this._baseManaCost + ((this._size - this._baseSize) / 5) + this._upcast
        this.manaCost = this._isDmgOrEffOnly ? cost : cost + 1
        super._updateCastData()
    }
}
export class Aura extends AreaOfEffectDelivery {
    override _baseSize: number = 10
}
export class Cone extends AreaOfEffectDelivery {
    override _baseSize: number = 15
}
export class Line extends AreaOfEffectDelivery {
    _baseSize: number = 30
}
export class Sphere extends AreaOfEffectDelivery {
    _baseSize: number = 5
}

abstract class PerTargetDelivery extends SpellDelivery {
    override _baseManaCost = 0
    _extraTargets = 0
    _extraTargetMultiplier = 1
    _targetLimit = 0

    setExtraTargets(targets: number) {
        this._extraTargets = targets
        this._updateCastData()
    }

    _updateCastData() {
        const cost = (this._extraTargets * this._extraTargetMultiplier) + this._baseManaCost + this._upcast
        this.manaCost = this._isDmgOrEffOnly ? cost : cost + 1
        super._updateCastData()
    }
}
export class Cube extends PerTargetDelivery {
    override _baseManaCost: number = 1
}
export class Imbue extends PerTargetDelivery {
    override _baseManaCost: number = 0
    override _extraTargetMultiplier: number = 2
}
export class Glyph extends PerTargetDelivery {
    override _baseManaCost: number = 2
}
export class Remote extends PerTargetDelivery {
    override _targetLimit: number = 1
}
export class Touch extends PerTargetDelivery {
    override _targetLimit: number = 1
}