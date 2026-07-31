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
import { getTargetIds } from "../../../../../../../utils/modelUtil"
import { SkillSelector } from "./SkillSelector"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { DamageRoll } from "../../../../../../../combat/engine/DamageRoll"
import { HeroAttack } from "../../../../../../../combat/engine/HeroAttack"

export const useSpellCastingMenu = (actor: Actor & { system: HeroDataModel }) => {
    const hero = actor.system

    const [isSpellcastingOpen, setIsSpellcastingOpen] = useState(false)
    const [spells, setSpells] = useState<(Item & { system: SpellDataModel })[]>([])
    const [spell, setSpell] = useState<Item & { system: SpellDataModel }>()
    const [skill, setSkill] = useState(hero.class?.castingSkill ?? '')
    const [deliveries, setDeliveries] = useState<SpellDelivery[]>([])
    const [delivery, setDelivery] = useState<SpellDelivery>()

    useEffect(() => {
        const spells = ItemsCache.spells().filter(it => hero.spells.map(sp => sp._sourceId).includes(it.uuid))
        setSpell(spells[0])
        setSpells(spells)
    }, [])

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
        const sp = spells.find(it => it.id === spellId)
        setSpell(sp)

        const deliveryClone = delivery?.clone()
        const delivs = deliveries.map(d => { return d.clone() })

        if (deliveryClone) {
            deliveryClone.spellBaseManaCost = sp?.system?.baseManaCost ?? 0
            if (sp?.system.damageType === 'none') {
                onUpdateDamageDice('0')
            }
            deliveryClone.calculateManaCost()
            delivs.forEach(it => {
                it.spellBaseManaCost = sp?.system.baseManaCost ?? 0
                it.calculateManaCost()
            })
            setDelivery(deliveryClone)
            setDeliveries(delivs)
        }
    }, [spell, delivery, deliveries, setDelivery, setDeliveries])

    const onSelectDelivery = useCallback((index: number) => {
        const clone = deliveries[index].clone()
        const delivs = deliveries.map(d => { return d.clone() })
        clone.spellBaseManaCost = spell?.system?.baseManaCost ?? 0
        clone.calculateManaCost()
        setDeliveries(delivs)
        setDelivery(clone)
    }, [delivery, deliveries])

    const onSelectSkill = useCallback((skill: string) => {
        setSkill(skill)
    }, [skill])

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
            if (spell?.system.damageType === 'none') {
                clone.damageDice = 0
            }
            clone.calculateManaCost()
            return clone
        })
        setDeliveries(delivs)
        setDelivery(delivs[delivs.findIndex(d => d.name === delivery.name)])
    }, [delivery, deliveries, spell])

    const onToggleSpellEffect = useCallback((isChecked: boolean) => {
        if (!delivery || !isChecked && spell?.system.damageType === 'none') return
        const delivs = deliveries.map(d => {
            const clone = d.clone()
            clone.applyEffect = isChecked
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

    const castSpell = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (spell && delivery) {
            hero.parent.update({ 'system.mana.current': Math.max(0, hero.mana.current - delivery.manaCost) })

            const attack = new HeroAttack(spell.name, hero.parent, getTargetIds())
            attack.skill = skill
            attack.isFavored = e.shiftKey
            attack.isHindered = !e.shiftKey && e.ctrlKey
            attack.sourceId = spell.uuid
            attack.spellDelivery = delivery.toJson()
            attack.damageRoll = new DamageRoll({
                atkName: spell.name,
                dmgType: spell.system.damageType,
                dice: [{ dice: delivery.damageDice, faces: hero.mana.spellDamageDie }],
                flatDmgBonus: (hero.modifiers.damage.spell ?? 0) + (hero.modifiers.damage.all ?? 0),
                perDieDmgBonus: (hero.modifiers.damage.spellPerDie ?? 0) + (hero.modifiers.damage.allPerDie ?? 0)
            })

            attack.initiate()
        }
    }

    const SpellcastingMenu = () => {
        return (<>
            {
                !isSpellcastingOpen ? <></> :
                    <div className="font-eskapade font-bold bg-context-menu-fill -mt-1 mb-1 p-2 space-y-2">
                        <div className="flex gap-x-2 items-end bottom text-lg">
                            <SpellSelector spell={spell} spells={spells} setSpellSelection={onSelectSpell} />
                            <DeliverySelector deliveries={deliveries} currentDelivery={delivery} onSelectDelivery={onSelectDelivery} />
                            <SkillSelector skill={skill} onSelectSkill={onSelectSkill} />
                            <div title={vgLiteLang.HeroSheet.skills_tooltip} className="ml-auto">
                                <PrimaryButton icon={<DamageTypeIcon dmgType={spell?.system?.damageType ?? ''} size={18} />} children={vgLiteLang.HeroSheet.Magic.btnCast} onClick={(e) => castSpell(e)} />
                            </div>
                        </div>
                        <div className="flex items-center">
                            {renderConfigs()}
                            {
                                spell?.system?.damageType === 'none' || (delivery instanceof Imbue) ? <></> :
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

    return { isSpellcastingOpen, setIsSpellcastingOpen, SpellcastingMenu }
}

