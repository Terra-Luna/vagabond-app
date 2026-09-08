import { useEffect } from "react"

import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import type { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { calculateRecurringRuleEligibility, getItemChoiceRules, normalizeRuleSelections } from "../../../rules/util/item-rules-util"
import { groupBy } from "../../../utils/collectionUtil"
import { useAlchemySelectionView } from "./AlchemySelectionView"

export const useAlchemySelection = (actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) => {

    const level = actor.system.level.current! + (isLevelUp ? 1 : 0)
    const clazz = actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }

    const { AlchemySelectionView, loadInitialSlots, alchemyItems, alchemySlots, setAlchemySlots } = useAlchemySelectionView(actor, isLevelUp)

    const getItemName = (id: string): string => {
        return alchemyItems.find(it => it.value === id)?.label ?? 'unk'
    }

    const loadSelections = (rules, setSlots) => {
        const slots = loadInitialSlots(rules.filter(r => r.level <= level || calculateRecurringRuleEligibility(level, r.level, r.scale)))
        let sharedIndex = 0
        rules.forEach(rule => {
            const ruleSelections = normalizeRuleSelections(rule.selections)
            ruleSelections.forEach(sel => {
                if (slots[sharedIndex]) {
                    slots[sharedIndex] = { value: sel.value, label: getItemName(sel.value), ruleName: rule.label, ruleId: rule.id }
                }
                sharedIndex += 1
            })
        })
        setSlots(slots)
    }

    useEffect(() => {
        const loadInitialAlchemySelections = async () => {
            if (clazz) {
                const rules = await getItemChoiceRules(level, clazz.system.rules ?? [])
                loadSelections(rules.filter(r => r.pack === "alchemical"), setAlchemySlots)
            }
        }
        loadInitialAlchemySelections()
    }, [])

    useEffect(() => {
        if (!clazz || !alchemySlots.length) return

        const rules = [...clazz.system.rules] as any[]
        const classSpellSlotGroups = groupBy("ruleId", alchemySlots)
        
        let hasChanges = false

        Object.keys(classSpellSlotGroups).forEach(ruleId => {
            const ruleIndex = rules.findIndex(r => r.id === ruleId)
            if (ruleIndex !== -1) {
                const nextValues = classSpellSlotGroups[ruleId]?.map(it => it.value ?? "").filter(Boolean) ?? []
                const currentSelections = normalizeRuleSelections(rules[ruleIndex].selections).filter(selection => !selection.subselect)
                const nextSelections = nextValues.map((value, index) => ({
                    ...(currentSelections[index] ?? { id: foundry.utils.randomID() }),
                    value,
                    subselect: ""
                }))
                if (JSON.stringify(currentSelections) !== JSON.stringify(nextSelections)) {
                    rules[ruleIndex].selections = nextSelections
                    hasChanges = true
                }
            }
        })

        if (hasChanges) {
            clazz.update({ "system.rules": rules} as Record<string, any>)
        }

    }, [alchemySlots])

    return { AlchemySelectionView }
}