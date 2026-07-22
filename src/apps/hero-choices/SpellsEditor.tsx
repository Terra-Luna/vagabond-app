import { useEffect } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { useSpellSelection } from "../hero-creator/step/SpellSelection"
import { getItemChoiceRules } from "../../rules/util/item-rules-util"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { groupBy } from "../../utils/collectionUtil"

export const SpellsEditor = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const ancestry = actor.items.find(it => (it.type as string) === 'ancestry') as Item & { system: AncestryDataModel }
    const clazz = actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }
    const perks = actor.system.perks as PerkDataModel[]

    // Slots:  { value: string, label: string, ruleName: string, ruleId: string }[]
    const { SpellSelection, classSpellSlots, perkSpellSlots,
        setAncestrySpellSlots, setClassSpellSlots, setPerkSpellSlots,
        loadInitialSlots, spellsList
    } = useSpellSelection(ancestry, clazz, perks, [])

    const loadSelections = (rules, setSlots) => {
        const slots = loadInitialSlots(rules)
        let sharedIndex = 0
        rules.forEach(rule => {
            rule.selections.forEach(sel => {
                slots[sharedIndex] = { value: sel, label: getSpellName(sel), ruleName: rule.label, ruleId: rule.id }
                sharedIndex += 1
            })
        })
        setSlots(slots)
    }

    /**
     * Load current spell choices...
     * spellsList is a transitive dependency, do not remove.
     */
    useEffect(() => {
        getItemChoiceRules(clazz?.system?.rules ?? []).then(rules => {
            loadSelections(rules.filter(r => r.pack === 'spell'), setClassSpellSlots)
        })
        getItemChoiceRules(ancestry?.system?.rules ?? []).then(rules => {
            loadSelections(rules.filter(r => r.pack === 'spell'), setAncestrySpellSlots)
        })
        getItemChoiceRules(perks.flatMap(p => p.rules)).then(rules => {
            const selectionFlags = actor.flags["vagabond-lite"].perkSelections ?? []
            rules.filter(r => r.pack === 'spell').forEach(rule => {
                rule.selections = selectionFlags[rule.id]
            })
            loadSelections(rules.filter(r => r.pack === 'spell'), setPerkSpellSlots)
        })
    }, [ancestry, clazz, perks, spellsList])

    /**
     * Monitors the Class spell slots and updates selections live.
     */
    useEffect(() => {
        const classRules = [...clazz.system.rules] as any[]
        const classSpellSlotGroups = groupBy("ruleId", classSpellSlots)
        Object.keys(classSpellSlotGroups).forEach(ruleId => {
            const ruleIndex = classRules.findIndex(r => r.id === ruleId)
            classRules[ruleIndex].selections = classSpellSlotGroups[ruleId]?.map(it => it.value)
        })
        clazz.update({ 'system.rules': classRules } as Record<string, any[]>)
    }, [clazz, classSpellSlots])

    /**
     * Monitors the Perk spell slots and saves to actor flags on selection.
     */
    useEffect(() => {
        const perkFlags = actor.getFlag("vagabond-lite" as any, "perkSelections") ?? {}
        const mutableFlags = foundry.utils.duplicate(perkFlags)
        const uniqueRuleIds = [...new Set(perkSpellSlots.map(s => s.ruleId))]
        uniqueRuleIds.forEach(ruleId => {
            mutableFlags[ruleId] = perkSpellSlots
                .filter(s => s.ruleId === ruleId)
                .map(it => it.value)
        })
        actor.update({ 'flags.vagabond-lite.perkSelections': mutableFlags } as Record<string, any>)
    }, [perkSpellSlots])

    const getSpellName = (id): string => {
        return spellsList.find(it => it.value === id)?.label ?? 'unk'
    }

    return (
        <div className="space-y-4 overflow-auto p-2">
            <SpellSelection />
        </div>
    )

}