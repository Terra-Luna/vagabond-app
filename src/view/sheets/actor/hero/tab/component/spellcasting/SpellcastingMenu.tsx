import { useCallback, useState } from "react"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { SpellDataModel } from "../../../../../../../model/item/character/SpellDataModel"
import { SpellSelector } from "./SpellSelector"
import { SpellTargetInput } from "./SpellTargetInput"
import { AreaOfEffectDelivery, getNewDeliveryOptions, Line, PerTargetDelivery, SpellDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { DeliverySelector } from "./DeliverySelectior"
import { TotalMana } from "./TotalMana"
import { SpellRangeInput } from "./SpellRangeInput"
import { DamageDiceInput } from "./DamageDiceInput"
import { PrimaryButton } from "../../../../../../component/Button"
import { SpellcastingErrMsg, SpellcastingSubtext } from "./SpellcastingTypography"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { SpellEffectToggle } from "./SpellEffectToggle"
import { SpellFocusToggle } from "./SpellFocusToggle"
import { LineExpansionInut } from "./LineExpansionInput"

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
        updatedDelivery.calculateManaCost()
        setDelivery(updatedDelivery)
        return true
    }, [delivery])

    const onUpdateAreaSize = useCallback(async (input: string | null) => {
        const size = Math.max((delivery as AreaOfEffectDelivery).baseSize, Number(input) || (delivery as AreaOfEffectDelivery).baseSize)
        const ConcreteCtor = delivery.constructor as new () => AreaOfEffectDelivery
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.size = size
        updatedDelivery.calculateManaCost()
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
        updatedDelivery.calculateManaCost()
        setDelivery(updatedDelivery)
        return true
    }, [delivery])

    const onUpdateLineHeight = useCallback((h: string) => {
        const height = Math.max((delivery as Line).baseHeight, Number(h) || (delivery as Line).baseHeight)
        const ConcreteCtor = delivery.constructor as new () => Line
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.height = height
        updatedDelivery.calculateManaCost()
        setDelivery(updatedDelivery)
        return true
    }, [delivery])

    const onUpdateLineWidth = useCallback((w: string) => {
        const width = Math.max((delivery as Line).baseWidth, Number(w) || (delivery as Line).baseWidth)
        const ConcreteCtor = delivery.constructor as new () => Line
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.width = width
        updatedDelivery.calculateManaCost()
        setDelivery(updatedDelivery)
        return true
    }, [delivery])

    const onToggleSpellEffect = useCallback((isChecked: boolean) => {
        const ConcreteCtor = delivery.constructor as new () => SpellDelivery
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.applyEffect = isChecked
        if (!updatedDelivery.applyEffect && updatedDelivery.damageDice === 0) {
            updatedDelivery.damageDice = 1
        }
        updatedDelivery.calculateManaCost()
        setDelivery(updatedDelivery)
    }, [delivery])

    const onToggleSpellFocus = useCallback((isChecked: boolean) => {
        const ConcreteCtor = delivery.constructor as new () => SpellDelivery
        const updatedDelivery = Object.assign(new ConcreteCtor(), delivery)
        updatedDelivery.isFocused = isChecked
        updatedDelivery.calculateManaCost()
        setDelivery(updatedDelivery)
    }, [delivery])

    const renderConfigs = () => {
        if (delivery instanceof AreaOfEffectDelivery) {
            return (<>
                <SpellRangeInput size={delivery.size} label={delivery.targetLabel} onUpdateAreaSize={onUpdateAreaSize} />
                {
                    delivery instanceof Line ? <LineExpansionInut delivery={delivery} onUpdateHeight={onUpdateLineHeight} onUpdateWidth={onUpdateLineWidth} /> : <></>
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
                        <div className="flex gap-x-4 items-end bottom text-lg">
                            <SpellSelector spell={spell} spells={spells} setSpellSelection={onSelectSpell} />
                            <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelectDelivery={onSelectDelivery} />
                            <div className="ml-auto">
                                <PrimaryButton children={vgLiteLang.HeroSheet.Magic.btnCast} onClick={() => { }} />
                            </div>
                        </div>
                        <div className="flex items-center">
                            {renderConfigs()}
                            <DamageDiceInput dmgDice={delivery.damageDice} onUpdateDmgDice={onUpdateDamageDice} />
                            <div className="ml-auto mt-1">
                                <SpellEffectToggle isEffect={delivery.applyEffect} onSpellEffectToggle={onToggleSpellEffect} />
                                <SpellFocusToggle isFocused={delivery.isFocused} onToggleSpellFocus={onToggleSpellFocus} />
                            </div>
                            <TotalMana delivery={delivery} />
                        </div>
                        {
                            delivery.manaCost > hero.mana.current ? <SpellcastingErrMsg /> : <></>
                        }
                        <SpellcastingSubtext text={delivery.description} />
                    </div>
            }
        </>)
    }

    return { isSpellcastingOpen, setIsSpellcastingOpen, spell, setSpell, setSpells, SpellcastingMenu }
}

