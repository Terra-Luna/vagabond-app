import { BookMarked, Dices } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { HeroAttack } from "../../../../../../../combat/engine/HeroAttack"
import { AreaOfEffectDelivery, getNewDeliveryOptions, Imbue, Line, PerTargetDelivery, Remote, SpellDelivery, SpellSnapshot } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { sys_id } from "../../../../../../../utils/foundryUtils"
import { appLang } from "../../../../../../../utils/lang"
import { tableBorder } from "../../../../../../common/border-styles"
import { buttonAnimation } from "../../../../../../component/Button"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { Tooltip } from "../../../../../../component/Tooltip"
import { DeliverySelector } from "./input/DeliverySelectior"
import { DiceCountInput } from "./input/DiceCountInput"
import { LineExpansionInut } from "./input/LineExpansionInput"
import { ManaDiscount } from "./input/ManaDiscount"
import { SkillSelector } from "./input/SkillSelector"
import { SpellcastingErrMsg, SpellcastingSubtext } from "./input/SpellcastingTypography"
import { SpellEffectToggle } from "./input/SpellEffectToggle"
import { SpellFocusToggle } from "./input/SpellFocusToggle"
import { SpellRangeInput } from "./input/SpellRangeInput"
import { SpellSelector } from "./input/SpellSelector"
import { SpellTargetInput } from "./input/SpellTargetInput"
import { TotalMana } from "./input/TotalMana"
import { UpcastingInput } from "./input/UpcastingInput"

interface SpellcastingMenuState {
    skill: string
    spellUuid: string
    deliveryName: string
    damageDice: number
    studyDamageDice: number
    applyEffect: boolean
    isFocused: boolean
    discount: number
    size?: number
    height?: number
    width?: number
    targetCount?: number
}

export const useSpellCastingMenu = (actor: Actor & { system: HeroDataModel }) => {
    const hero = actor.system

    const [isSpellcastingOpen, setIsSpellcastingOpen] = useState(false)
    const [skill, setSkill] = useState(hero.class?.castingSkill ?? '')
    const [deliveries, setDeliveries] = useState<SpellDelivery[]>([])
    const [deliveryIndex, setDeliveryIndex] = useState<number>(6)

    const spells = useMemo((): SpellSnapshot[] => {
        return ItemsCache.spells()
            .filter(it => hero.spells.map(sp => sp._sourceId).includes(it.uuid))
            .map(sp => SpellDelivery.getSpellSnapshot(sp))
    }, [actor, JSON.stringify(actor.system.class?.rules ?? []), JSON.stringify(hero.spells.map(sp => sp._sourceId))])

    useEffect(() => {
        const savedState = actor.getFlag(sys_id, "spellcastingMenuState" as any) as SpellcastingMenuState | undefined
        const spell = spells.find(sp => sp.uuid === savedState?.spellUuid) ?? spells[0]
        const deliveryOptions = getNewDeliveryOptions(spell, { ...actor.system.modifiers.casting })

        if (savedState) {
            const index = deliveryOptions.findIndex(d => d.name === savedState.deliveryName)
            if (index !== -1) {
                const delivery = deliveryOptions[index]
                delivery.setDamageDice(savedState.damageDice)
                delivery.setStudyDamageDice(savedState.studyDamageDice)
                delivery.setApplyEffect(savedState.applyEffect)
                delivery.setIsFocused(savedState.isFocused)
                delivery.setDiscount(savedState.discount)
                if (delivery instanceof AreaOfEffectDelivery && savedState.size !== undefined) {
                    delivery.setSize(savedState.size)
                }
                if (delivery instanceof Line && savedState.height !== undefined && savedState.width !== undefined) {
                    delivery.setHeight(savedState.height)
                    delivery.setWidth(savedState.width)
                }
                if (delivery instanceof PerTargetDelivery && savedState.targetCount !== undefined) {
                    delivery.setTargetCount(savedState.targetCount)
                }
                setDeliveryIndex(index)
            }
            setSkill(savedState.skill)
        }

        setDeliveries(deliveryOptions)
    }, [])

    const onUpdateTargetTokens = useCallback(async (tokens: Token[]) => {
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            if (clone instanceof PerTargetDelivery) {
                clone.setTargetTokenIds(tokens.map(t => t.id))
            }
            return clone
        })
        setDeliveries(delivs)
    }, [deliveryIndex, deliveries])

    /**
     * A hook that listens to their token targeting events and
     * updates the target count for Remote & Imbue.
     */
    useEffect(() => {
        const handleTargetChange = (user, token, isTargeted) => {
            if (user.id !== game.user?.id) return
            onUpdateTargetTokens(Array.from(game.user?.targets ?? []))
        }
        const hookId = Hooks.on('targetToken', handleTargetChange)
        return () => { Hooks.off('targetToken', hookId) }
    }, [onUpdateTargetTokens])

    const onSelectSpell = useCallback((uuid: string) => {
        const sp = spells.find(it => it.uuid === uuid)
        if (!sp) return
        setDeliveries(prev =>
            prev.map(d => {
                const clone = d.clone()
                clone.setSpell(sp)
                return clone
            })
        )
    }, [spells, setDeliveries])

    const onSelectDelivery = useCallback((index) => {
        setDeliveryIndex(index)
    }, [])

    const onSelectSkill = useCallback((skill: string) => {
        setSkill(skill)
    }, [skill])

    const onUpdateAreaSize = useCallback(async (input: string | null) => {
        const size = Number(input)
        setDeliveries(deliveries.map(d => {
            if (d instanceof AreaOfEffectDelivery) {
                const clone = d.clone()
                clone.setSize(Math.round(size / 5) * 5)
                return clone
            }
            else return d
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateLineHeight = useCallback((h: string) => {
        const size = Number(h)
        setDeliveries(deliveries.map(d => {
            if (d instanceof Line) {
                const clone = d.clone()
                clone.setHeight(Math.round(size / 5) * 5)
                return clone
            }
            else return d
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateLineWidth = useCallback((w: string) => {
        const size = Number(w)
        setDeliveries(deliveries.map(d => {
            if (d instanceof Line) {
                const clone = d.clone()
                clone.setWidth(Math.round(size / 5) * 5)
                return clone
            }
            else return d
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateDamageDice = useCallback(async (input: string | null) => {
        const dmgDice = Math.max(0, Number(input) || 0)
        setDeliveries(deliveries.map(d => {
            const clone = d.clone()
            clone.setDamageDice(dmgDice)
            return clone
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateStudyDamageDice = useCallback(async (input: string | null) => {
        const dice = Math.max(0, Number(input) || 0)
        setDeliveries(deliveries.map(d => {
            const clone = d.clone()
            clone.setStudyDamageDice(Math.min(hero.statuses.counters.studied, dice))
            return clone
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateUpcast = useCallback(async (input: string | null) => {
        const upcast = Math.max(0, Number(input) || 0)
        setDeliveries(deliveries.map(d => {
            const clone = d.clone()
            clone.setUpcast(upcast)
            return clone
        }))
    }, [deliveryIndex, deliveries])

    const onToggleSpellEffect = useCallback((isChecked: boolean) => {
        setDeliveries(deliveries.map(d => {
            const clone = d.clone()
            clone.setApplyEffect(isChecked)
            return clone
        }))
    }, [deliveryIndex, deliveries])

    const onToggleSpellFocus = useCallback((isChecked: boolean) => {
        setDeliveries(deliveries.map(d => {
            const clone = d.clone()
            clone.setIsFocused(isChecked)
            return clone
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateDiscount = useCallback((discount: number) => {
        setDeliveries(deliveries.map(d => {
            const clone = d.clone()
            clone.setDiscount(discount)
            return clone
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateTargetCount = useCallback(async (input: string | null) => {
        const count = Math.max(1, Number(input) || 1)
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            if (clone instanceof PerTargetDelivery) {
                clone.setTargetCount(count)
            }
            return clone
        })
        setDeliveries(delivs)
    }, [deliveryIndex, deliveries])

    const targetOrAreaInput = () => {
        if (deliveries[deliveryIndex] instanceof AreaOfEffectDelivery) {
            return (<>
                <SpellRangeInput
                    size={deliveries[deliveryIndex].size}
                    label={deliveries[deliveryIndex].targetLabel}
                    onUpdateAreaSize={onUpdateAreaSize}
                />
            </>)
        }
        else if (deliveries[deliveryIndex] instanceof PerTargetDelivery) {
            const delivery = deliveries[deliveryIndex]
            if (delivery.targetLimit === 0) {
                return <SpellTargetInput
                    delivery={delivery}
                    onUpdateTargetCount={onUpdateTargetCount}
                    readOnly={delivery instanceof Remote || delivery instanceof Imbue}
                />
            }
        }
    }

    const renderLineExpansions = () => {
        if (deliveries[deliveryIndex] instanceof Line) {
            return (
                <LineExpansionInut
                    delivery={deliveries[deliveryIndex]}
                    onUpdateHeight={onUpdateLineHeight}
                    onUpdateWidth={onUpdateLineWidth}
                />
            )
        }
        return null
    }

    const saveSpellcastingMenuState = useCallback(async (delivery: SpellDelivery) => {
        const state: SpellcastingMenuState = {
            skill,
            spellUuid: delivery.spell.uuid,
            deliveryName: delivery.name,
            damageDice: delivery.damageDice,
            studyDamageDice: delivery.studyDamageDice,
            applyEffect: delivery.applyEffect,
            isFocused: delivery.isFocused,
            discount: delivery.discount,
            size: delivery instanceof AreaOfEffectDelivery ? delivery.size : undefined,
            height: delivery instanceof Line ? delivery.height : undefined,
            width: delivery instanceof Line ? delivery.width : undefined,
            targetCount: delivery instanceof PerTargetDelivery ? delivery.targetCount : undefined
        }
        await actor.setFlag(sys_id, "spellcastingMenuState" as any, state)
    }, [actor, skill])

    const castSpell = async (e: React.MouseEvent<HTMLDivElement>) => {
        const delivery = deliveries[deliveryIndex]
        if (delivery && delivery.spell) {
            onUpdateStudyDamageDice('0')
            await saveSpellcastingMenuState(delivery)
            HeroAttack.buildSpellAttack(hero.parent, skill, delivery, e)?.initiate(e)
        }
    }

    const SpellcastingMenu = () => {
        const delivery = deliveries[deliveryIndex]
        const spell = delivery?.spell
        return (<>
            {isSpellcastingOpen && delivery && spell &&
                <div className={`flex flex-col gap-2font-eskapade font-bold bg-context-menu-fill -mt-1 mb-1 p-1 ${tableBorder}`}>

                    {/* SPELLCASTING MENU TOP ROW */}
                    <div className="flex gap-x-0.5 items-end text-lg w-full min-w-0 overflow-hidden">
                        <SpellSelector spell={delivery.spell} spells={spells} onSelect={onSelectSpell} />
                        <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelect={onSelectDelivery} />
                        <SkillSelector skill={skill} onSelectSkill={onSelectSkill} />
                        {/* CAST BUTTON */}
                        <div className="@container ml-auto flex-shrink min-w-0 max-w-[100px] w-full">
                            <Tooltip title={`Cast: ${delivery?.spell.name} (${delivery?.manaCost ?? 0} Mana)`} content={`${delivery?.name ?? ''} | ${delivery?.targetLabel}: ${(delivery as any).targetCount ?? (delivery as any).size ?? ""}<br>${appLang.HeroSheet.skills_tooltip}`}>
                                <button
                                    type="button"
                                    onClick={(e: any) => castSpell(e)}
                                    className={`
                                        flex text-btn-primary-text justify-center font-eskapade
                                        bg-btn-primary-fill rounded px-2 py-2 w-full min-w-0 ${buttonAnimation}
                                    `}>
                                    <div className="flex gap-x-1 items-center min-w-0 whitespace-nowrap text-[calc(10cqw+8px)] max-text-base">
                                        {spell.damageType !== 'none' &&
                                            <span className="w-[1.0em] h-[1.0em] flex items-center justify-center flex-shrink-0">
                                                <DamageTypeIcon dmgType={spell.damageType ?? ''} size={"100%" as any} />
                                            </span>
                                        }
                                        {appLang.HeroSheet.Magic.btnCast}
                                    </div>
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {/* SECOND ROW, DELIVERY CUSTOMIZATION INPUTS */}
                    <div className="flex flex-wrap gap-2 items-end mt-2">
                        {/* TARGET COUNT, AREA INPUT, AND LINE EXPANSIONS */}
                        <div className="flex gap-x-1 items-end">
                            {targetOrAreaInput()}
                            {renderLineExpansions()}
                        </div>

                        <div className="flex gap-x-1 ml-auto items-end font-eskapade">
                            {spell.damageType !== 'none' &&
                                <div className="flex gap-x-1">
                                    {/* DAMAGE DICE INPUT */}
                                    <div className="flex flex-col">
                                        <div className="flex gap-x-1">
                                            <Dices size={18} className="self-center text-text-header-tertiary" />
                                            <p className="text-sm text-text-header-tertiary font-bold">
                                                d{hero.modifiers.dice.size.spell.bonus + 6}
                                            </p>
                                        </div>
                                        <DiceCountInput dmgDice={delivery?.damageDice} onUpdateDmgDice={onUpdateDamageDice} />
                                    </div>

                                    {/* IF THE CLASS CAN USE STUDIED DICE AS DAMAGE */}
                                    {hero.modifiers.casting.studyDiceDamage &&
                                        <div className="flex flex-col">
                                            <div className="flex gap-x-1">
                                                <BookMarked size={18} className="text-ic-studied self-center" />
                                                <p className="text-sm text-text-header-tertiary font-bold">d6</p>
                                            </div>
                                            <DiceCountInput dmgDice={delivery?.studyDamageDice} onUpdateDmgDice={onUpdateStudyDamageDice} />
                                        </div>
                                    }
                                </div>
                            }

                            {spell.upcastableEffect && <UpcastingInput upcast={delivery?.upcast} onUpdateUpcast={onUpdateUpcast} />}

                            {/* MANA DISCOUNT INPUT */}
                            <ManaDiscount discount={delivery?.discount} onUpdateDiscount={onUpdateDiscount} />

                            {/* SPELL EFFECT AND FOCUS TOGGLES */}
                            <div className="flex-col ml-auto">
                                <SpellEffectToggle isEffect={delivery?.applyEffect} onSpellEffectToggle={onToggleSpellEffect} />
                                <SpellFocusToggle isFocused={delivery?.isFocused} onToggleSpellFocus={onToggleSpellFocus} />
                            </div>

                            <TotalMana cost={delivery?.manaCost ?? 0} />

                        </div>
                    </div>

                    {/* Insufficient mana error message */}
                    <div className="flex ml-auto">
                        <SpellcastingErrMsg cost={delivery?.manaCost ?? 0} mana={hero.mana.value} maxCast={hero.mana.maxCast} />
                    </div>

                    {/* User-help description of the chosen delivery */}
                    <SpellcastingSubtext text={delivery?.description ?? ''} />
                </div>
            }
        </>)
    }

    return { isSpellcastingOpen, setIsSpellcastingOpen, onSelectSpell, SpellcastingMenu }
}