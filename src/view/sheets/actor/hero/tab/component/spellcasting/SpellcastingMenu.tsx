import { BookMarked,Dices } from "lucide-react"
import { useCallback,useEffect, useMemo, useState } from "react"

import { HeroAttack } from "../../../../../../../combat/engine/HeroAttack"
import { AreaOfEffectDelivery, getNewDeliveryOptions, Imbue,Line, PerTargetDelivery, Remote, SpellDelivery, SpellSnapshot } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { appLang } from "../../../../../../../utils/lang"
import { tableBorder } from "../../../../../../common/border-styles"
import { buttonAnimation } from "../../../../../../component/Button"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
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
    }, [actor, JSON.stringify(actor.system.class?.rules ?? [])])

    useEffect(() => {
        const deliveryOptions = getNewDeliveryOptions(spells[0], { ...actor.system.modifiers.casting })
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

    const renderConfigs = () => {
        if (deliveries[deliveryIndex] instanceof AreaOfEffectDelivery) {
            return (<>
                <SpellRangeInput
                    size={deliveries[deliveryIndex].size}
                    label={deliveries[deliveryIndex].targetLabel}
                    onUpdateAreaSize={onUpdateAreaSize}
                />
                {deliveries[deliveryIndex] instanceof Line &&
                    <LineExpansionInut
                        delivery={deliveries[deliveryIndex]}
                        onUpdateHeight={onUpdateLineHeight}
                        onUpdateWidth={onUpdateLineWidth}
                    />
                }
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

    const castSpell = async (e: React.MouseEvent<HTMLDivElement>) => {
        const delivery = deliveries[deliveryIndex]
        if (delivery && delivery.spell) {
            onUpdateStudyDamageDice('0')
            HeroAttack.buildSpellAttack(hero.parent, skill, delivery, e)?.initiate(e)
        }
    }

    const SpellcastingMenu = () => {
        const delivery = deliveries[deliveryIndex]
        const spell = delivery?.spell
        return (<>
            {
                isSpellcastingOpen && delivery && spell &&
                <div className={`font-eskapade font-bold bg-context-menu-fill -mt-1 mb-1 p-2 space-y-2 ${tableBorder}`}>

                        {/* SPELLCASTING MENU TOP ROW */}
                        <div className="flex gap-x-1 items-end bottom text-lg">
                            <SpellSelector spell={delivery.spell} spells={spells} onSelect={onSelectSpell} />
                            <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelect={onSelectDelivery} />
                            <SkillSelector skill={skill} onSelectSkill={onSelectSkill} />
                        </div>

                        {/* SECOND ROW, DELIVERY CUSTOMIZATION INPUTS */}
                        <div className="flex flex-wrap gap-1 items-end mt-4">
                            {renderConfigs()}
                            <div className="flex gap-x-2 items-end ml-auto">
                                {spell.damageType !== 'none' &&
                                    <div className="flex gap-x-1">
                                        {/* DAMAGE DICE INPUT */}
                                        <div className="flex flex-col">
                                            <div className="flex gap-x-1 items-baseline">
                                                <Dices size={18} className="self-center text-text-header-tertiary" />
                                                <p className="text-sm text-text-header-tertiary font-normal">d{hero.modifiers.dice.size.spell.bonus + 6}</p>
                                            </div>
                                            <DiceCountInput dmgDice={delivery?.damageDice} onUpdateDmgDice={onUpdateDamageDice} />
                                        </div>
                                        {/* IF THE CLASS CAN USE STUDIED DICE AS DAMAGE */}
                                        {hero.modifiers.casting.studyDiceDamage &&
                                            <div className="flex flex-col">
                                                <div className="flex gap-x-1 items-baseline">
                                                    <BookMarked size={18} className="text-ic-studied self-center" />
                                                    <p className="text-sm text-text-header-tertiary font-normal">d6</p>
                                                </div>
                                                <DiceCountInput dmgDice={delivery?.studyDamageDice} onUpdateDmgDice={onUpdateStudyDamageDice} />
                                            </div>
                                        }
                                    </div>}

                                {/* MANA DISCOUNT INPUT */}
                                <ManaDiscount discount={delivery?.discount} onUpdateDiscount={onUpdateDiscount} />

                                <div className="flex-col">
                                    <SpellEffectToggle isEffect={delivery?.applyEffect} onSpellEffectToggle={onToggleSpellEffect} />
                                    <SpellFocusToggle isFocused={delivery?.isFocused} onToggleSpellFocus={onToggleSpellFocus} />
                                </div>
                            </div>
                        </div>

                        {/* Insufficient mana error message */}
                        <SpellcastingErrMsg cost={delivery?.manaCost ?? 0} mana={hero.mana.value} maxCast={hero.mana.maxCast} />

                        {/* User-help description of the chosen delivery */}
                        <div className="flex gap-x-1">
                            <SpellcastingSubtext text={delivery?.description ?? ''} />
                            {/* CAST BUTTON */}
                            <div className="ml-auto">
                                <button
                                    type="button"
                                    title={appLang.HeroSheet.skills_tooltip}
                                    className={`text-btn-primary-text px-1 py-0.5 bg-btn-primary-fill rounded hover-glow cursor-pointer ${buttonAnimation}`}
                                    onClick={(e: any) => castSpell(e)}
                                >
                                    <div className="flex gap-x-2 text-sm items-center">
                                        <TotalMana cost={delivery?.manaCost ?? 0} />
                                        <div className="flex flex-col items-center font-eskapade">
                                            {spell.damageType !== 'none' &&
                                                <DamageTypeIcon dmgType={spell.damageType ?? ''} size={18} />
                                            }
                                            {appLang.HeroSheet.Magic.btnCast}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
            }
        </>)
    }

    return { isSpellcastingOpen, setIsSpellcastingOpen, onSelectSpell, SpellcastingMenu }
}