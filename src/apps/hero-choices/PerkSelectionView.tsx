import { useEffect, useMemo, useRef } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { calculateRecurringRuleEligibility, getItemChoiceRules, normalizeRuleSelections, randomId } from "../../rules/util/item-rules-util"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { groupBy } from "../../utils/collectionUtil"
import { usePerkBonusSelection } from "../hero-creator/step/PerkBonusSelection"
import { usePerkSelection } from "../hero-creator/step/PerkSelectionUseCase"

export const usePerkSelectionView = (actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) => {
    const dataLoaded = useRef(false)
    const loadedSelectionKey = useRef("")
    const ancestry = actor.items.find(item => (item.type as string) === "ancestry") as Item & { system: AncestryDataModel }
    const clazz = actor.items.find(item => (item.type as string) === "class") as Item & { system: ClassDataModel }
    const level = (actor.system.level.current ?? 0) + (isLevelUp ? 1 : 0)
    const stats = actor.system.stats as any
    const trainings = useMemo(() => Object.keys(actor.system.skills).filter(skill => actor.system.skills[skill].isTrained), [actor.system.skills])
    const spells = useMemo(() => actor.system.spells.map(spell => spell.parent.name), [actor.system.spells])
    // Not memoized: Foundry mutates actor.system.stats in place, so a memo keyed on that reference would never see a bonus update.
    const actorStats = Object.keys(stats).map(stat => ({ stat, value: stats[stat] }))
    const actorSpellSlots = useMemo(() => actor.system.spells.map(spell => ({
        value: (spell as any)._sourceId ?? (spell as any).uuid ?? "",
        label: (spell as any).parent?.name ?? "",
        ruleName: "",
        ruleId: ""
    })).filter(spell => spell.value), [actor.system.spells])
    const { PerkSelection, allPerks, perksList, classPerkSlots, ancestryPerkSlots, loadInitialSlots, setAncestryPerkSlots, setClassPerkSlots } =
        usePerkSelection(ancestry, clazz, stats, trainings, spells, [], level, true)
    const bonusPerks = useMemo(() => [...ancestryPerkSlots, ...classPerkSlots].flatMap(slot => {
        const perk = ItemsCache.perks().find(item => item.uuid === slot.value)
        return perk?.system.rules.some(rule => rule.key === "ChoiceSet") ? [{ sourceKey: slot.selectionId, system: perk.system } as any] : []
    }), [ancestryPerkSlots, classPerkSlots])
    // Not memoized: actor.items is a persistent collection mutated in place, so a memo on it would never see a saved rule change.
    const initialSelections = Object.fromEntries(
        (actor.items.contents as any[]).filter(item => ["class", "ancestry"].includes(item.type)).flatMap(item =>
            (((item.system as any).rules ?? []) as any[]).flatMap(parentRule => normalizeRuleSelections(parentRule.selections).flatMap(selection => {
                const perk = ItemsCache.perks().find(candidate => candidate.uuid === selection.value)
                return (perk?.system.rules ?? [])
                    .filter(rule => rule.key === "ChoiceSet")
                    .map(rule => [`${selection.id}:${rule.id}`, selection.subselect ? [selection.subselect] : []])
            })))
    )

    const { bonusChoicesByPerk, allBonusSelections } = usePerkBonusSelection(bonusPerks, actorStats, [], trainings.map(skill => ({ skill, ruleId: "" })), actorSpellSlots, [], [], [], initialSelections)

    const getPerkName = (id: string) => allPerks.find(item => item.uuid === id)?.name ?? "unk"

    const loadSelections = (rules: any[], setSlots: any) => {
        const slots = loadInitialSlots(rules.filter(rule => rule.level <= level || calculateRecurringRuleEligibility(level, rule.level, rule.scale)))
        let sharedIndex = 0
        rules.forEach(rule => normalizeRuleSelections(rule.selections).forEach(selection => {
            if (slots[sharedIndex]) slots[sharedIndex] = { ...slots[sharedIndex], selectionId: selection.id, value: selection.value, label: getPerkName(selection.value), ruleName: rule.label, ruleId: rule.id }
            sharedIndex += 1
        }))
        setSlots(slots)
    }

    const perksLoaded = perksList.length > 1

    useEffect(() => {
        if (!perksLoaded) return
        const key = `${ancestry?.id ?? ""}:${clazz?.id ?? ""}:${level}`
        if (loadedSelectionKey.current === key) return
        if (clazz) loadSelections(getItemChoiceRules(level, clazz.system.rules ?? []).filter(rule => rule.pack === "perk"), setClassPerkSlots)
        if (ancestry) loadSelections(getItemChoiceRules(level, ancestry.system.rules ?? []).filter(rule => rule.pack === "perk"), setAncestryPerkSlots)
        dataLoaded.current = true
        loadedSelectionKey.current = key
    }, [ancestry?.id, clazz?.id, level, perksLoaded])

    const persistSlots = (item: any, slots: any[], pendingBonusSelections: { ruleId: string, selectionId?: string, value: string }[] = []) => {
        if (!item || !slots.length || !dataLoaded.current) return
        const rules = foundry.utils.deepClone(item.system.rules ?? []) as any[]

        const groupedSlots = Object.entries(groupBy("ruleId", slots)) as [string, any[]][]

        groupedSlots.forEach(([ruleId, grouped]) => {
            const rule = rules.find(candidate => candidate.id === ruleId)
            if (!rule) return
            const current = normalizeRuleSelections(rule.selections)
            rule.selections = grouped.map(slot => {
                const existing = current.find(selection => selection.id === slot.selectionId)
                const existingValue = existing?.value
                // Prefer the in-memory bonus selection over the server read, which may not yet reflect a subselect save still in flight.
                const pendingBonus = pendingBonusSelections.find(b => b.selectionId === slot.selectionId)
                const preservedSubselect = pendingBonus ? pendingBonus.value : (existing?.subselect ?? "")
                return {
                    ...(existing ?? { id: slot.selectionId ?? randomId() }),
                    value: slot.value,
                    subselect: existingValue === slot.value ? preservedSubselect : ""
                }
            }).filter(selection => selection.value)
        })

        item.update({ "system.rules": rules } as Record<string, any>)
        actor.system.forceUpdate()
    }

    useEffect(() => persistSlots(clazz, classPerkSlots, allBonusSelections), [clazz, classPerkSlots, allBonusSelections])
    useEffect(() => persistSlots(ancestry, ancestryPerkSlots, allBonusSelections), [ancestry, ancestryPerkSlots, allBonusSelections])

    return {
        PerkSelection,
        bonusChoicesByPerk,
        hasBonusChoices: bonusPerks.length > 0,
        classPerkSlots,
        setClassPerkSlots
    }
}
