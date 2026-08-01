import { AreaOfEffectDelivery, getNewDeliveryOptions, Imbue, Line, PerTargetDelivery, Remote, SpellDelivery, SpellSnapshot } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { useCallback, useEffect, useMemo, useState } from "react"
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
import { getTargetIds } from "../../../../../../../utils/modelUtil"
import { SkillSelector } from "./SkillSelector"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { DamageRoll } from "../../../../../../../combat/engine/DamageRoll"
import { HeroAttack } from "../../../../../../../combat/engine/HeroAttack"

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
    }, [actor])

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
            if (!(clone instanceof Remote) && !(clone instanceof Imbue) && clone instanceof PerTargetDelivery) {
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
            await hero.parent.update({ 'system.mana.current': Math.max(0, hero.mana.current - delivery.manaCost) })

            const attack = new HeroAttack(delivery.spell.name, hero.parent, getTargetIds())
            attack.skill = skill
            attack.isFavored = e.shiftKey
            attack.isHindered = !e.shiftKey && e.ctrlKey
            attack.sourceId = delivery.spell.uuid
            attack.skipSkillCheck = delivery instanceof Imbue
            attack.spellDelivery = delivery.toJson()
            attack.damageRoll = new DamageRoll({
                atkName: delivery.spell.name,
                dmgType: delivery.spell.damageType,
                dice: [{ dice: delivery.damageDice, faces: hero.mana.spellDamageDie }],
                flatDmgBonus: (hero.modifiers.damage.spell ?? 0) + (hero.modifiers.damage.all ?? 0),
                perDieDmgBonus: (hero.modifiers.damage.spellPerDie ?? 0) + (hero.modifiers.damage.allPerDie ?? 0)
            })

            attack.initiate()
        }
    }

    const SpellcastingMenu = () => {
        const delivery = deliveries[deliveryIndex]
        const spell = delivery?.spell
        return (<>
            {
                isSpellcastingOpen && delivery && spell &&
                    <div className="font-eskapade font-bold bg-context-menu-fill -mt-1 mb-1 p-2 space-y-2">
                        <div className="flex gap-x-2 items-end bottom text-lg">
                            <SpellSelector spell={delivery.spell} spells={spells} onSelect={onSelectSpell} />
                            <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelect={onSelectDelivery} />
                            <SkillSelector skill={skill} onSelectSkill={onSelectSkill} />
                            <div title={vgLiteLang.HeroSheet.skills_tooltip} className="ml-auto">
                                <PrimaryButton icon={<DamageTypeIcon dmgType={spell.damageType ?? ''} size={18} />} onClick={(e) => castSpell(e)}>
                                    {vgLiteLang.HeroSheet.Magic.btnCast}
                                </PrimaryButton>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {renderConfigs()}
                            {spell.damageType !== 'none' &&
                                <DamageDiceInput dmgDice={delivery?.damageDice} onUpdateDmgDice={onUpdateDamageDice} />
                            }
                            <div className="ml-auto mt-1 space-y-1">
                                <SpellEffectToggle isEffect={delivery?.applyEffect} onSpellEffectToggle={onToggleSpellEffect} />
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

    return { isSpellcastingOpen, setIsSpellcastingOpen, SpellcastingMenu }
}