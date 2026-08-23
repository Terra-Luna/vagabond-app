import { useEffect, useRef } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { calculateRecurringRuleEligibility, getItemChoiceRules, normalizeRuleSelections, savePerkSelections } from "../../rules/util/item-rules-util"
import { groupBy } from "../../utils/collectionUtil"
import { useSpellSelection } from "../hero-creator/step/SpellSelectionUseCase"

export const useSpellSelectionView = (actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) => {

    const ancestry = actor.items.find(it => (it.type as string) === 'ancestry') as Item & { system: AncestryDataModel }
    const clazz = actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }
    const perks = actor.system.perks as PerkDataModel[]
    const level = ((actor as any).system.level.current ?? 0) + (isLevelUp ? 1 : 0)

    // Used for tracking spell slot loading upon opening the editor.
    const dataLoaded = useRef(false)

    const {
        SpellSelection,
        classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants,
        setAncestrySpellSlots, setClassSpellSlots, setPerkSpellSlots, loadInitialSlots, spellsList
    } = useSpellSelection(level, ancestry, clazz, perks, [])

    const getSpellName = (id: string): string => {
        return spellsList.find(it => it.value === id)?.label ?? 'unk'
    }

    const loadSelections = (rules, setSlots) => {
        const slots = loadInitialSlots(rules.filter(r => r.level <= level || calculateRecurringRuleEligibility(level, r.level, r.scale)))
        let sharedIndex = 0
        rules.forEach(rule => {
            const ruleSelections = normalizeRuleSelections(rule.selections)
            ruleSelections.forEach(sel => {
                if (slots[sharedIndex]) {
                    slots[sharedIndex] = { value: sel.value, label: getSpellName(sel.value), ruleName: rule.label, ruleId: rule.id }
                }
                sharedIndex += 1
            })
        })
        setSlots(slots)
    }

    const ancestryId = ancestry?.id ?? ''
    const classId = clazz?.id ?? ''
    const perksSignature = JSON.stringify(perks.map(p => (p as any).id ?? p._sourceId))
    const spellsLoaded = spellsList.length > 1

    /**
     * Loads initial spell selections...
     */
    useEffect(() => {
        if (!spellsLoaded) return

        /**
         * This needs to remain async to prevent their Magical Secret
         * spells slots from getting blanked-out on render frame 0.
         */
        const loadInitialSpellSelections = async () => {
            if (clazz) {
                const rules = await getItemChoiceRules(level, clazz.system.rules ?? [])
                loadSelections(rules.filter(r => r.pack === 'spell'), setClassSpellSlots)
            }
            if (ancestry) {
                const rules = await getItemChoiceRules(level, ancestry.system.rules ?? [])
                loadSelections(rules.filter(r => r.pack === 'spell'), setAncestrySpellSlots)
            }
            if (perks.length > 0) {
                const rules = await getItemChoiceRules(level, perks.flatMap(p => p.rules))
                const targetRules = rules.filter(r => r.pack === 'spell')
                targetRules.forEach(rule => {
                    rule.selections = normalizeRuleSelections(rule.selections)
                })
                loadSelections(targetRules, setPerkSpellSlots)
            }

            dataLoaded.current = true
        }

        loadInitialSpellSelections()
    }, [ancestryId, classId, perksSignature, spellsLoaded])

    /**
     * Monitors Class spell choices and makes async background changes on the fly.
     */
    useEffect(() => {
        if (!clazz || !classSpellSlots.length || !dataLoaded.current) return

        const classRules = [...clazz.system.rules] as any[]
        const classSpellSlotGroups = groupBy("ruleId", classSpellSlots)

        let hasChanges = false
        Object.keys(classSpellSlotGroups).forEach(ruleId => {
            const ruleIndex = classRules.findIndex(r => r.id === ruleId)
            if (ruleIndex !== -1) {
                const nextValues = classSpellSlotGroups[ruleId]?.map(it => it.value ?? "").filter(Boolean) ?? []
                const currentSelections = normalizeRuleSelections(classRules[ruleIndex].selections).filter(selection => !selection.subselect)
                const nextSelections = nextValues.map((value, index) => ({
                    ...(currentSelections[index] ?? { id: foundry.utils.randomID() }),
                    value,
                    subselect: ""
                }))
                if (JSON.stringify(currentSelections) !== JSON.stringify(nextSelections)) {
                    classRules[ruleIndex].selections = nextSelections
                    hasChanges = true
                }
            }
        })

        if (hasChanges) {
            clazz.update({ 'system.rules': classRules } as Record<string, any>)
        }
    }, [classSpellSlots])

    /**
     * Monitors Perk spell selections and async background changes on the fly.
     */
    useEffect(() => {
        if (!actor || !perkSpellSlots.length || !dataLoaded.current) return
        savePerkSelections(actor, perkSpellSlots)
    }, [actor, perkSpellSlots, perks])

    return { SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants }
}
