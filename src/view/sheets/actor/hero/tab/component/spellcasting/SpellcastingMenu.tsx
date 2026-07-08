import { useCallback, useState } from "react"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { SpellDataModel } from "../../../../../../../model/item/character/SpellDataModel"
import { SpellSelector } from "./SpellSelector"
import { SpellTargetInput } from "./SpellTargetInput"
import { AreaOfEffectDelivery, getNewDeliveryOptions, Line, PerTargetDelivery, SpellDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { DeliverySelector } from "./DeliverySelectior"
import { TotalMana } from "./TotalMana"
import { AreaSizeInput } from "./AreaSizeInput"
import { DamageDiceInput } from "./DamageDiceInput"
import { PrimaryButton } from "../../../../../../component/Button"
import { SpellcastingLabel } from "./SpellcastingTypography"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { Checkbox } from "../../../../../../component/Checkbox"
import { SpellEffectToggle } from "./SpellEffectToggle"

const deliveries = getNewDeliveryOptions()

export const useSpellCastingMenu = (hero: HeroDataModel) => {
    const [isSpellcastingOpen, setIsSpellcastingOpen] = useState(false)
    const [spells, setSpells] = useState<SpellDataModel[]>(hero.spells as SpellDataModel[])
    const [spell, setSpell] = useState<SpellDataModel>()
    const [delivery, setDelivery] = useState<SpellDelivery>(deliveries[0])

    const onSelectSpell = useCallback((spell: any) => {
        setSpell(hero?.parent.items.get(spell).system)
        return spell
    }, [])

    const onSelectDelivery = useCallback((index: number) => {
        const d = deliveries[index]
        const ConcreteCtor = d.constructor as new () => SpellDelivery
        const selectedDelivery = Object.assign(new ConcreteCtor(), d)
        setDelivery(selectedDelivery)
    }, [delivery])

    const onUpdateTargetCount = useCallback(async (input: string | null) => {
        const count = Math.max(1, Number(input) || 1)
        const ConcreteCtor = delivery.constructor as new () => PerTargetDelivery
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.targets = count
        updatedDelivery.updateCastData()
        setDelivery(updatedDelivery)
        return true
    }, [delivery])

    const onUpdateAreaSize = useCallback(async (input: string | null) => {
        const size = Math.max((delivery as AreaOfEffectDelivery).baseSize, Number(input) || (delivery as AreaOfEffectDelivery).baseSize)
        const ConcreteCtor = delivery.constructor as new () => AreaOfEffectDelivery
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.size = size
        updatedDelivery.updateCastData()
        setDelivery(updatedDelivery)
        return true
    }, [delivery])

    const onUpdateDamageDice = useCallback(async (input: string | null) => {
        const dmgDice = Math.max(0, Number(input) || 0)
        const ConcreteCtor = delivery.constructor as new () => SpellDelivery
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.damageDice = dmgDice
        if (updatedDelivery.damageDice === 0) {
            updatedDelivery.applyEffect = true
        }
        updatedDelivery.updateCastData()
        setDelivery(updatedDelivery)
        return true
    }, [delivery])

    const onCheckedLineExtension = useCallback((isChecked: boolean) => {
        const ConcreteCtor = delivery.constructor as new () => Line
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.isExtended = isChecked
        updatedDelivery.updateCastData()
        setDelivery(updatedDelivery)
    }, [delivery])

    const onToggleSpellEffect = useCallback((isChecked: boolean) => {
        const ConcreteCtor = delivery.constructor as new () => SpellDelivery
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.applyEffect = isChecked
        if (!updatedDelivery.applyEffect && updatedDelivery.damageDice === 0) {
            updatedDelivery.damageDice = 1
        }
        updatedDelivery.updateCastData()
        setDelivery(updatedDelivery)
    }, [delivery])

    const renderConfigs = () => {
        if (delivery instanceof AreaOfEffectDelivery) {
            return (<>
                <AreaSizeInput size={delivery.size} onUpdateAreaSize={onUpdateAreaSize} />
                {
                    delivery instanceof Line ?
                        <div>
                            <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelExtend} />
                            <Checkbox label={''} checked={delivery.isExtended} onCheckedChanged={onCheckedLineExtension} />
                        </div> : <></>
                }
            </>)
        }
        else if (delivery instanceof PerTargetDelivery) {
            if (delivery.targetLimit === 0) {
                return <SpellTargetInput delivery={delivery} onUpdateTargetCount={onUpdateTargetCount} />
            }
        }
        return <></>
    }

    const SpellcastingMenu = () => {
        return (<>
            {
                !isSpellcastingOpen ? <></> :
                    <div className="font-eskapade font-bold border border-solid border-table-border rounded-sm p-2 space-y-2">
                        <div className="flex gap-x-8 items-top text-lg">
                            <SpellSelector spell={spell} spells={spells} setSpellSelection={onSelectSpell} />
                            <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelectDelivery={onSelectDelivery} />
                        </div>
                        <div className="flex gap-x-4 items-center">
                            {renderConfigs()}
                            <DamageDiceInput dmgDice={delivery.damageDice} onUpdateDmgDice={onUpdateDamageDice} />
                            <SpellEffectToggle isEffect={delivery.applyEffect} onSpellEffectToggle={onToggleSpellEffect} />
                            <TotalMana delivery={delivery} />
                            <PrimaryButton children={vgLiteLang.HeroSheet.Magic.btnCast} onClick={() => { }} />
                        </div>
                    </div>
            }
        </>)
    }

    return { isSpellcastingOpen, setIsSpellcastingOpen, setSpell, setSpells, SpellcastingMenu }
}

