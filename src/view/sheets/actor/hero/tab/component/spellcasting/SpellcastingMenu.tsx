import { AreaOfEffectDelivery, getNewDeliveryOptions, Imbue, Line, PerTargetDelivery, Remote, SpellDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { useCallback, useEffect, useState } from "react"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { SpellDataModel } from "../../../../../../../model/item/character/SpellDataModel"
import { SpellSelector } from "./SpellSelector"
import { SpellTargetInput } from "./SpellTargetInput"
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
import { sendVgLiteChatMessage } from "../../../../../../chat/ChatCardSerializer"
import { SpellCastChatCard } from "../../../../../../chat/SpellCastChatCard"
import { getId } from "../../../../../../../utils/modelUtil"
import { DamageRollResult, rollDamage } from "../../../../../../../combat/dice-rolls"

export const useSpellCastingMenu = (hero: HeroDataModel) => {
    const [isSpellcastingOpen, setIsSpellcastingOpen] = useState(false)
    const [spells, setSpells] = useState<Item & { system: SpellDataModel }[]>(hero.parent.items.filter(i => i.type === 'spell') as Item & { system: SpellDataModel }[])
    const [spell, setSpell] = useState<Item & { system: SpellDataModel }>()
    const [deliveries, setDeliveries] = useState<SpellDelivery[]>([])
    const [delivery, setDelivery] = useState<SpellDelivery>()

    useEffect(() => {
        const deliveryOptions = getNewDeliveryOptions()
        setDeliveries(deliveryOptions)
        setDelivery(deliveryOptions[0])
    }, [])

    const onUpdateTargetTokens = useCallback(async (tokens: Token[]) => {
        if (!delivery) return
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            clone.targetTokenIds = tokens.map(t => t.id)
            clone.calculateManaCost()
            return clone
        })
        setDelivery(delivs[delivs.findIndex(d => d.name === delivery.name)])
        setDeliveries(delivs)
    }, [delivery, deliveries])

    useEffect(() => {
        const handleTargetChange = (user, token, isTargeted) => {
            if (user.id !== game.user?.id) return
            onUpdateTargetTokens(Array.from(game.user?.targets ?? []))
        }
        const hookId = Hooks.on('targetToken', handleTargetChange)
        return () => { Hooks.off('targetToken', hookId) }
    }, [onUpdateTargetTokens])

    const onSelectSpell = useCallback((spellId: string) => {
        const sp = hero?.parent.items.get(spellId)
        setSpell(sp)
        console.log(sp)
        if (delivery && sp?.system.damageType === 'none') {
            onUpdateDamageDice('0')
            onToggleSpellEffect(true)
        }
    }, [spell, delivery])

    const onSelectDelivery = useCallback((index: number) => {
        const clone = deliveries[index].clone()
        const delivs = deliveries.map(d => { return d.clone() })
        setDeliveries(delivs)
        setDelivery(clone)
    }, [delivery, deliveries])

    const onUpdateTargetCount = useCallback(async (input: string | null) => {
        if (!delivery) return
        const count = Math.max(1, Number(input) || 1)
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            if (!(d instanceof Remote) && !(d instanceof Imbue)) {
                clone.targetCount = count
            }
            clone.calculateManaCost()
            return clone
        })
        setDelivery(delivs[delivs.findIndex(d => d.name === delivery.name)])
        setDeliveries(delivs)
    }, [delivery, deliveries])

    const onUpdateAreaSize = useCallback(async (input: string | null) => {
        if (!delivery) return
        const size = Math.max((delivery as AreaOfEffectDelivery).baseSize, Number(input) || (delivery as AreaOfEffectDelivery).baseSize)
        const clone = delivery.clone();
        (clone as AreaOfEffectDelivery).size = size
        clone.calculateManaCost()
        setDelivery(clone)
        setDeliveries(deliveries.map(d => {
            if (d.name === delivery.name) {
                (d as AreaOfEffectDelivery).size = size
                return d
            }
            else {
                return d
            }
        }))
    }, [delivery, deliveries])

    const onUpdateLineHeight = useCallback((h: string) => {
        if (!delivery) return
        const height = Math.max((delivery as Line).baseHeight, Number(h) || (delivery as Line).baseHeight)
        const clone = delivery.clone() as Line
        clone.height = height
        clone.calculateManaCost()
        setDelivery(clone)
        setDeliveries(deliveries.map(d => {
            if (d.name === delivery.name) {
                (d as Line).height = height
                return d
            }
            else {
                return d
            }
        }))
    }, [delivery, deliveries])

    const onUpdateLineWidth = useCallback((w: string) => {
        if (!delivery) return
        const width = Math.max((delivery as Line).baseWidth, Number(w) || (delivery as Line).baseWidth)
        const clone = delivery.clone() as Line
        clone.width = width
        clone.calculateManaCost()
        setDelivery(clone)
        setDeliveries(deliveries.map(d => {
            if (d.name === delivery.name) {
                (d as Line).width = width
                return d
            }
            else {
                return d
            }
        }))
    }, [delivery, deliveries])

    const onUpdateDamageDice = useCallback(async (input: string | null) => {
        if (!delivery) return
        const dmgDice = Math.max(0, Number(input) || 0)
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            clone.damageDice = dmgDice
            if (clone.damageDice === 0) { clone.applyEffect = true }
            if (spell?.system.damageType === 'none') { clone.damageDice = 0 }
            clone.calculateManaCost()
            return clone
        })
        setDeliveries(delivs)
        setDelivery(delivs[delivs.findIndex(d => d.name === delivery.name)])
    }, [delivery, deliveries])

    const onToggleSpellEffect = useCallback((isChecked: boolean) => {
        if (!delivery || !isChecked && spell?.system.damageType === 'none') return
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            clone.applyEffect = isChecked
            if (!clone.applyEffect && clone.damageDice === 0) {
                clone.damageDice = 1
            }
            clone.calculateManaCost()
            return clone
        })
        setDeliveries(delivs)
        setDelivery(delivs[delivs.findIndex(d => d.name === delivery.name)])
    }, [delivery, deliveries])

    const onToggleSpellFocus = useCallback((isChecked: boolean) => {
        if (!delivery) return
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            clone.isFocused = isChecked
            return clone
        })
        setDeliveries(delivs)
        setDelivery(delivs[delivs.findIndex(d => d.name === delivery.name)])
    }, [delivery, deliveries])

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
                return <SpellTargetInput
                    delivery={delivery}
                    onUpdateTargetCount={onUpdateTargetCount}
                    readOnly={delivery instanceof Remote || delivery instanceof Imbue}
                />
            }
        }
        return <></>
    }

    const castSpell = async () => {
        if (spell && delivery) {
            let dmgRoll: DamageRollResult | undefined = undefined
            if (spell.system.damageType !== 'none' && delivery.damageDice > 0) {
                dmgRoll = await rollDamage(
                    spell.name,
                    spell.system.damageType,
                    `${delivery.damageDice}d${hero.mana.spellDamageDie}`,
                    0, false, [], //perDieDmgBonus, canExplode, explodesOn
                    spell.system.appliesBurn,
                    spell.system.burnCountdown
                )
            }
            sendVgLiteChatMessage(
                hero.parent,
                <SpellCastChatCard
                    heroId={getId(hero)}
                    spell={spell}
                    delivery={{ ...delivery }}
                    dmgRoll={dmgRoll}
                />
            )
            setIsSpellcastingOpen(false)
        }
    }

    const SpellcastingMenu = () => {
        return (<>
            {
                !isSpellcastingOpen ? <></> :
                    <div className="font-eskapade font-bold bg-table-border/10 border border-solid border-t-table-border -mt-1 mb-1 p-2 space-y-2">
                        <div className="flex gap-x-4 items-end bottom text-lg">
                            <SpellSelector spell={spell} spells={spells} setSpellSelection={onSelectSpell} />
                            <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelectDelivery={onSelectDelivery} />
                            <div className="ml-auto">
                                <PrimaryButton children={vgLiteLang.HeroSheet.Magic.btnCast} onClick={castSpell} />
                            </div>
                        </div>
                        <div className="flex items-center">
                            {renderConfigs()}
                            {
                                spell?.system?.damageType === 'none' ? <></> :
                                    <DamageDiceInput dmgDice={delivery?.damageDice} onUpdateDmgDice={onUpdateDamageDice} />
                            }
                            <div className="ml-auto mt-1 space-y-1">
                                {
                                    !(delivery instanceof Imbue) && spell?.system.damageType !== 'none' ?
                                        <SpellEffectToggle isEffect={delivery?.applyEffect} onSpellEffectToggle={onToggleSpellEffect} />
                                        : <></>

                                }
                                <SpellFocusToggle isFocused={delivery?.isFocused} onToggleSpellFocus={onToggleSpellFocus} />
                            </div>
                            <TotalMana cost={delivery?.manaCost ?? 0} />
                        </div>
                        {
                            (delivery?.manaCost ?? 0) > hero.mana.current ? <SpellcastingErrMsg /> : <></>
                        }
                        <SpellcastingSubtext text={delivery?.description ?? ''} />
                    </div>
            }
        </>)
    }

    return { isSpellcastingOpen, setIsSpellcastingOpen, spell, setSpell, setSpells, SpellcastingMenu }
}

