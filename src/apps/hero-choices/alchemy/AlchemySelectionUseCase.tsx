import { useEffect } from "react"

import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import type { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { getItemChoiceRules, getItemRules, normalizeRuleSelections, saveItemRuleSelections } from "../../../rules/util/item-rules-util"
import { groupBy } from "../../../utils/collectionUtil"
import { useAlchemySelectionView } from "./AlchemySelectionView"

export const useAlchemySelection = (actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean, hideCompendiumLink?: boolean) => {

    const level = actor.system.level.current! + (isLevelUp ? 1 : 0)
    const clazz = actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }

    const { AlchemySelectionView, loadInitialSlots, alchemyItems, alchemySlots, setAlchemySlots } = useAlchemySelectionView(actor, isLevelUp, hideCompendiumLink)

    const getItemName = (id: string): string => {
        return alchemyItems.find(it => it.value === id)?.label ?? 'unk'
    }

    const loadSelections = (rules, setSlots) => {
        const slots = loadInitialSlots(rules)
        let offset = 0
        rules.forEach(rule => {
            const count = Number(rule.maxChoices) || 0
            normalizeRuleSelections(rule.selections).forEach((sel, i) => {
                const slotIndex = offset + i
                if (i < count && slots[slotIndex]) {
                    slots[slotIndex] = { value: sel.value, label: getItemName(sel.value), ruleName: rule.label, ruleId: rule.id }
                }
            })
            offset += count
        })
        setSlots(slots)
    }

    useEffect(() => {
        const loadInitialAlchemySelections = async () => {
            if (clazz) {
                const rules = await getItemChoiceRules(level, getItemRules(clazz))
                loadSelections(rules.filter(r => r.pack === "alchemical"), setAlchemySlots)
            }
        }
        loadInitialAlchemySelections()
    }, [])

    useEffect(() => {
        if (!clazz || !alchemySlots.length) return

        const rules = getItemRules(clazz)
        const selectionUpdates: Record<string, any> = {}
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
                    selectionUpdates[ruleId] = nextSelections
                    hasChanges = true
                }
            }
        })

        if (hasChanges) {
            saveItemRuleSelections(clazz, selectionUpdates)
        }

    }, [alchemySlots])

    return { AlchemySelectionView, alchemyItems, alchemySlots }
}