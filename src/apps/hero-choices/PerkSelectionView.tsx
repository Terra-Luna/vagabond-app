import { useEffect, useMemo, useRef } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { calculateRecurringRuleEligibility, getItemChoiceRules } from "../../rules/util/item-rules-util"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { groupBy } from "../../utils/collectionUtil"
import { usePerkSelection } from "../hero-creator/step/PerkSelectionUseCase"

export const usePerkSelectionView = (actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) => {
    const dataLoaded = useRef(false)
    const loadedSelectionKey = useRef("")

    const ancestry = actor.items.find(it => (it.type as string) === 'ancestry') as Item & { system: AncestryDataModel }
    const clazz = actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }
    const stats = actor.system.stats as any

    const trainings = useMemo(() => {
        return Object.keys(actor.system.skills).filter(k => actor.system.skills[k].isTrained)
    }, [actor.system.skills])

    const spells = useMemo(() => {
        return actor.system.spells.map(sp => sp.parent.name)
    }, [actor.system.spells])

    const perks = actor.system.perks as PerkDataModel[]
    const level = (actor.system.level.current ?? 0) + (isLevelUp ? 1 : 0)

    const {
        PerkSelection, allPerks, perksList, classPerkSlots, loadInitialSlots, setAncestryPerkSlots, setClassPerkSlots
    } = usePerkSelection(ancestry, clazz, stats, trainings, spells, [], level, isLevelUp)

    const getPerkName = (id: string): string => {
        return allPerks.find(it => it.uuid === id)?.name ?? 'unk'
    }

    const loadSelections = (rules, setSlots) => {
        const slots = loadInitialSlots(rules.filter(r => r.level <= level || calculateRecurringRuleEligibility(level, r.level, r.scale)))
        let sharedIndex = 0
        const perkSelectionRuleIds = Object.keys(actor.getFlag("vagabond-lite" as any, "perkSelections") ?? {})

        rules.forEach(rule => {
            const ruleSelections = Array.isArray(rule.selections) ? rule.selections : []
            ruleSelections.forEach(sel => {
                const perkRuleIds = ItemsCache.perks().find(p => p.uuid === sel)?.system?.rules?.map(r => r.id) ?? []
                const isLocked = perkSelectionRuleIds?.some((id: string) => perkRuleIds.includes(id))
                if (slots[sharedIndex]) {
                    slots[sharedIndex] = {
                        value: sel,
                        label: getPerkName(sel),
                        ruleName: rule.label,
                        ruleId: rule.id,
                        isLocked: isLocked
                    }
                }
                sharedIndex += 1
            })
        })
        setSlots(slots)
    }

    const ancestryId = ancestry?.id ?? ''
    const classId = clazz?.id ?? ''
    const perksLoaded = perksList.length > 1

    useEffect(() => {
        if (!perksLoaded) return

        const selectionKey = `${ancestryId}:${classId}:${level}`
        if (loadedSelectionKey.current === selectionKey) return

        const loadInitialPerkSelections = () => {
            if (clazz) {
                const rules = getItemChoiceRules(level, clazz.system.rules ?? [])
                loadSelections(rules.filter(r => r.pack === 'perk'), setClassPerkSlots)
            }
            if (ancestry) {
                const rules = getItemChoiceRules(level, ancestry.system.rules ?? [])
                loadSelections(rules.filter(r => r.pack === 'perk'), setAncestryPerkSlots)
            }
            if (perks.length > 0) {
                const rules = getItemChoiceRules(level, perks.flatMap(p => p.rules))
                const selectionFlags = (actor.flags?.["vagabond-lite"] as any)?.perkSelections ?? {}
                const targetRules = rules.filter(r => r.pack === 'perk')
                targetRules.forEach(rule => {
                    rule.selections = selectionFlags[rule.id] ?? []
                })
            }

            dataLoaded.current = true
            loadedSelectionKey.current = selectionKey
        }

        loadInitialPerkSelections()
    }, [ancestryId, classId, level, perksLoaded])

    /**
     * Monitors Class perk choices and makes async background changes on the fly.
     */
    useEffect(() => {
        if (!clazz || !classPerkSlots.length || !dataLoaded.current) {
            return
        }

        const classRules = [...clazz.system.rules] as any[]
        const classPerkSlotGroups = groupBy("ruleId", classPerkSlots)

        let hasChanges = false
        Object.keys(classPerkSlotGroups).forEach(ruleId => {
            const ruleIndex = classRules.findIndex(r => r.id === ruleId)
            if (ruleIndex !== -1) {
                const nextValues = classPerkSlotGroups[ruleId]?.map(it => it.value ?? "") ?? []
                if (JSON.stringify(classRules[ruleIndex].selections) !== JSON.stringify(nextValues)) {
                    classRules[ruleIndex].selections = nextValues
                    hasChanges = true
                }
            }
        })

        if (hasChanges) {
            clazz.update({ 'system.rules': classRules } as Record<string, any>)
            actor.system.forceUpdate()
        }
    }, [clazz, dataLoaded, classPerkSlots])

    return { PerkSelection, classPerkSlots, setClassPerkSlots }
}
