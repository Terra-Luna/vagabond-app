import { useEffect, useRef, useState } from "react"

import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { PerkDataModel } from "../../../model/item/character/PerkDataModel"
import { getItemChoiceRules, getItemRules, normalizeRuleSelections, saveItemRuleSelections, savePerkSelections } from "../../../rules/util/item-rules-util"
import { groupBy } from "../../../utils/collectionUtil"
import { sys_id } from "../../../utils/foundryUtils"
import { useSpellSelectionView } from "./SpellSelectionView"

export const useSpellSelection = (actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean, pendingClassItem?: Item & { system: ClassDataModel }) => {

    const ancestry = actor.items.find(it => (it.type as string) === 'ancestry') as Item & { system: AncestryDataModel }
    const clazz = pendingClassItem ?? (actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel })
    const perks = actor.system.perks as PerkDataModel[]
    const level = ((actor as any).system.level.current ?? 0) + (isLevelUp ? 1 : 0)

    // Used for tracking spell slot loading upon opening the editor.
    const dataLoaded = useRef(false)

    const [selectionsLoaded, setSelectionsLoaded] = useState(false)

    const {
        SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants,
        setAncestrySpellSlots, setClassSpellSlots, setPerkSpellSlots, loadInitialSlots, spellsList
    } = useSpellSelectionView(level, ancestry, clazz, perks, [], selectionsLoaded)

    const getSpellName = (id: string): string => {
        return spellsList.find(it => it.value === id)?.label ?? 'unk'
    }

    const loadSelections = (rules, setSlots) => {
        const slots = loadInitialSlots(rules)
        let offset = 0
        rules.forEach(rule => {
            const count = Number(rule.maxChoices) || 0
            normalizeRuleSelections(rule.selections).forEach((sel, i) => {
                const slotIndex = offset + i
                if (i < count && slots[slotIndex]) {
                    slots[slotIndex] = {
                        ...slots[slotIndex],
                        selectionId: sel.id,
                        value: sel.value,
                        label: getSpellName(sel.value),
                        ruleName: rule.label,
                        ruleId: rule.id
                    }
                }
            })
            offset += count
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
                const rules = (await getItemChoiceRules(level, getItemRules(clazz)))
                    .sort((a: any, b: any) => Number(Boolean(a.skipAtHeroCreation)) - Number(Boolean(b.skipAtHeroCreation)))
                loadSelections(rules.filter(r => r.pack === 'spell'), setClassSpellSlots)
            }
            if (ancestry) {
                const rules = await getItemChoiceRules(level, getItemRules(ancestry))
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
            setSelectionsLoaded(true)
        }

        loadInitialSpellSelections()
    }, [ancestryId, classId, perksSignature, spellsLoaded])

    /**
     * Monitors Class spell choices and makes async background changes on the fly.
     */
    useEffect(() => {
        if (!clazz || !classSpellSlots.length || !dataLoaded.current) return
        if (clazz.parent !== actor) return // Not yet embedded on the Actor; nothing to persist to.

        const classRules = getItemRules(clazz)
        const classSpellSlotGroups = groupBy("ruleId", classSpellSlots)
        const selectionUpdates: Record<string, any> = {}

        let hasChanges = false

        Object.keys(classSpellSlotGroups).forEach(ruleId => {
            const ruleIndex = classRules.findIndex(r => r.id === ruleId)

            if (ruleIndex !== -1) {
                const nextValues = classSpellSlotGroups[ruleId]
                    ?.map(it => it.value ?? "")
                    .filter(Boolean) ?? []

                const currentSelections = normalizeRuleSelections(classRules[ruleIndex].selections)

                const nextSelections = nextValues.map((value, index) => ({
                    ...(currentSelections[index] ?? { id: foundry.utils.randomID() }),
                    value,
                    subselect: ""
                }))

                if (JSON.stringify(currentSelections) !== JSON.stringify(nextSelections)) {
                    classRules[ruleIndex].selections = nextSelections
                    selectionUpdates[ruleId] = nextSelections
                    hasChanges = true
                }
            }
        })

        if (hasChanges) {
            saveItemRuleSelections(clazz, selectionUpdates)
            actor.setFlag(sys_id, "spellcastingMenuState", {})
        }
    }, [classSpellSlots])

    /**
     * Monitors Ancestry spell choices and makes async background changes on the fly.
     * This lets a player pick a new ancestral spell after a GM swaps their Ancestry.
     */
    useEffect(() => {
        if (!ancestry || !ancestrySpellSlots.length || !dataLoaded.current) return
        if (ancestry.parent !== actor) return // Not yet embedded on the Actor; nothing to persist to.

        const ancestryRules = getItemRules(ancestry)
        const ancestrySpellSlotGroups = groupBy("ruleId", ancestrySpellSlots)
        const selectionUpdates: Record<string, any> = {}

        let hasChanges = false

        Object.keys(ancestrySpellSlotGroups).forEach(ruleId => {
            const ruleIndex = ancestryRules.findIndex(r => r.id === ruleId)

            if (ruleIndex !== -1) {
                const nextValues = ancestrySpellSlotGroups[ruleId]
                    ?.map(it => it.value ?? "")
                    .filter(Boolean) ?? []

                const currentSelections = normalizeRuleSelections(ancestryRules[ruleIndex].selections)

                const nextSelections = nextValues.map((value, index) => ({
                    ...(currentSelections[index] ?? { id: foundry.utils.randomID() }),
                    value,
                    subselect: ""
                }))

                if (JSON.stringify(currentSelections) !== JSON.stringify(nextSelections)) {
                    ancestryRules[ruleIndex].selections = nextSelections
                    selectionUpdates[ruleId] = nextSelections
                    hasChanges = true
                }
            }
        })

        if (hasChanges) {
            saveItemRuleSelections(ancestry, selectionUpdates)
        }
    }, [ancestrySpellSlots])

    /**
     * Monitors Perk spell selections and async background changes on the fly.
     */
    useEffect(() => {
        if (!actor || !perkSpellSlots.length || !dataLoaded.current) return
        savePerkSelections(actor, perkSpellSlots)
    }, [actor, perkSpellSlots])

    return { SpellSelection, classSpellSlots, perkSpellSlots, ancestrySpellSlots, classSpellGrants, ancestrySpellGrants }
}