import { useEffect, useRef } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { useSpellSelection } from "../hero-creator/step/SpellSelection"
import { getItemChoiceRules, savePerkSelectionFlags } from "../../rules/util/item-rules-util"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { groupBy } from "../../utils/collectionUtil"

export const SpellsEditor = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const ancestry = actor.items.find(it => (it.type as string) === 'ancestry') as Item & { system: AncestryDataModel }
    const clazz = actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }
    const perks = actor.system.perks as PerkDataModel[]

    // Used for tracking spell slot loading upon opening the editor.
    const dataLoaded = useRef(false)

    const {
        SpellSelection, classSpellSlots, perkSpellSlots, setAncestrySpellSlots,
        setClassSpellSlots, setPerkSpellSlots, loadInitialSlots, spellsList
    } = useSpellSelection(ancestry, clazz, perks, [])

    const getSpellName = (id: string): string => {
        return spellsList.find(it => it.value === id)?.label ?? 'unk'
    }

    const loadSelections = (rules, setSlots) => {
        const slots = loadInitialSlots(rules)
        let sharedIndex = 0
        rules.forEach(rule => {
            const ruleSelections = Array.isArray(rule.selections) ? rule.selections : []
            ruleSelections.forEach(sel => {
                if (slots[sharedIndex]) {
                    slots[sharedIndex] = { value: sel, label: getSpellName(sel), ruleName: rule.label, ruleId: rule.id }
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

        const loadInitialSpellSelections = async () => {
            if (clazz) {
                const rules = await getItemChoiceRules(clazz.system.rules ?? [])
                loadSelections(rules.filter(r => r.pack === 'spell'), setClassSpellSlots)
            }
            if (ancestry) {
                const rules = await getItemChoiceRules(ancestry.system.rules ?? [])
                loadSelections(rules.filter(r => r.pack === 'spell'), setAncestrySpellSlots)
            }
            if (perks.length > 0) {
                const rules = await getItemChoiceRules(perks.flatMap(p => p.rules))
                const selectionFlags = (actor.flags?.["vagabond-lite"] as any)?.perkSelections ?? {}
                const targetRules = rules.filter(r => r.pack === 'spell')
                targetRules.forEach(rule => {
                    rule.selections = selectionFlags[rule.id] ?? []
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
                const nextValues = classSpellSlotGroups[ruleId]?.map(it => it.value ?? "") ?? []
                if (JSON.stringify(classRules[ruleIndex].selections) !== JSON.stringify(nextValues)) {
                    classRules[ruleIndex].selections = nextValues
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
        savePerkSelectionFlags(actor, perkSpellSlots)
    }, [perkSpellSlots])

    return (
        <div className="space-y-4 overflow-auto p-2">
            <SpellSelection />
        </div>
    )
}
