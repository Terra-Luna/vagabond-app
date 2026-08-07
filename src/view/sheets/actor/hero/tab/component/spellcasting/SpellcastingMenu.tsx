import { AreaOfEffectDelivery, getNewDeliveryOptions, Imbue, Line, PerTargetDelivery, Remote, SpellDelivery, SpellSnapshot } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { useCallback, useEffect, useMemo, useState } from "react"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { SpellTargetInput } from "./SpellTargetInput"
import { DeliverySelector } from "./DeliverySelectior"
import { TotalMana } from "./TotalMana"
import { SpellRangeInput } from "./SpellRangeInput"
import { DiceCountInput } from "./DiceCountInput"
import { PrimaryButton } from "../../../../../../component/Button"
import { SpellcastingErrMsg, SpellcastingSubtext } from "./SpellcastingTypography"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { SpellEffectToggle } from "./SpellEffectToggle"
import { SpellFocusToggle } from "./SpellFocusToggle"
import { LineExpansionInut } from "./LineExpansionInput"
import { SkillSelector } from "./SkillSelector"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { HeroAttack } from "../../../../../../../combat/engine/HeroAttack"
import { SpellSelector } from "./SpellSelector"
import { Dices } from "lucide-react"

export const useSpellCastingMenu = (actor: Actor & { system: HeroDataModel }) => {
    const hero = actor.system

    const [isSpellcastingOpen, setIsSpellcastingOpen] = useState(false)
    const [skill, setSkill] = useState(hero.class?.castingSkill ?? '')
    const [deliveries, setDeliveries] = useState<SpellDelivery[]>([])
    const [deliveryIndex, setDeliveryIndex] = useState<number>(0)

    const spells = useMemo((): SpellSnapshot[] => {
        return ItemsCache.spells()
            .filter(it => hero.spells.map(sp => sp._sourceId).includes(it.uuid))
            .map(sp => SpellDelivery.getSpellSnapshot(sp))
    }, [actor, JSON.stringify(actor.system.class?.rules ?? [])])

    useEffect(() => {
        const deliveryOptions = getNewDeliveryOptions(spells[0])
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
                clone.setSize(size)
                return clone
            }
            else return d
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateLineHeight = useCallback((h: string) => {
        setDeliveries(deliveries.map(d => {
            if (d instanceof Line) {
                const clone = d.clone()
                clone.setHeight(Number(h))
                return clone
            }
            else return d
        }))
    }, [deliveryIndex, deliveries])

    const onUpdateLineWidth = useCallback((w: string) => {
        setDeliveries(deliveries.map(d => {
            if (d instanceof Line) {
                const clone = d.clone()
                clone.setWidth(Number(w))
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
            HeroAttack.buildSpellAttack(hero.parent, skill, delivery, e).initiate()
        }
    }

    const SpellcastingMenu = () => {
        const delivery = deliveries[deliveryIndex]
        const spell = delivery?.spell
        return (<>
            {
                isSpellcastingOpen && delivery && spell &&
                    <div className="font-eskapade font-bold bg-context-menu-fill -mt-1 mb-1 p-2 space-y-2">

                        {/* SPELLCASTING MENU TOP ROW */}
                        <div className="flex gap-x-2 items-end bottom text-lg">
                            <SpellSelector spell={delivery.spell} spells={spells} onSelect={onSelectSpell} />
                            <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelect={onSelectDelivery} />
                            <SkillSelector skill={skill} onSelectSkill={onSelectSkill} />
                            <div className="ml-auto">
                                <PrimaryButton
                                    title={vgLiteLang.HeroSheet.skills_tooltip}
                                    icon={<DamageTypeIcon dmgType={spell.damageType ?? ''} size={18} />}
                                    onClick={(e) => castSpell(e)}
                                >
                                    {vgLiteLang.HeroSheet.Magic.btnCast}
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* SECOND ROW, DELIVERY CUSTOMIZATION INPUTS */}
                        <div className="flex gap-x-1 items-end mt-4">
                            {renderConfigs()}
                            <div className="flex items-end ml-auto">
                                {spell.damageType !== 'none' &&
                                    <div>
                                        <Dices size={18} className="text-text-secondary" />
                                        <DiceCountInput dmgDice={delivery?.damageDice} onUpdateDmgDice={onUpdateDamageDice} />
                                    </div>
                                }
                                <div className="flex-col ml-2">
                                    <SpellEffectToggle isEffect={delivery?.applyEffect} onSpellEffectToggle={onToggleSpellEffect} />
                                    <SpellFocusToggle isFocused={delivery?.isFocused} onToggleSpellFocus={onToggleSpellFocus} />
                                </div>
                                <TotalMana cost={delivery?.manaCost ?? 0} />
                            </div>
                        </div>

                        {/* Insufficient mana error message */}
                        {(delivery?.manaCost ?? 0) > hero.mana.current && <SpellcastingErrMsg />}

                        {/* User-help description of the chosen delivery */}
                        <SpellcastingSubtext text={delivery?.description ?? ''} />
                    </div>
            }
        </>)
    }

    return { isSpellcastingOpen, setIsSpellcastingOpen, SpellcastingMenu }
}