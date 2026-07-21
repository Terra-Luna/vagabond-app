import { useEffect } from "react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { AncestryDataModel } from "../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { useSpellSelection } from "../hero-creator/step/SpellSelection"
import { getItemChoiceRules } from "../../view/component/rules/util/item-rules-util"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"

export const SpellsEditor = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const ancestry = actor.items.find(it => (it.type as string) === 'ancestry') as Item & { system: AncestryDataModel }
    const clazz = actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }
    const perks = actor.system.perks as PerkDataModel[]

    // Slots:  { value: string, label: string, ruleId: string }[]
    const { SpellSelection, classSpellSlots, perkSpellSlots, setAncestrySpellSlots, setClassSpellSlots, setPerkSpellSlots, loadInitialSlots, spellsList } = useSpellSelection(ancestry, clazz, perks, [])

    /**
     * Load current spell choices...
     */
    useEffect(() => {
        getItemChoiceRules(clazz?.system?.rules ?? []).then(rules => {
            const slots: any[] = []
            rules.forEach(rule => {
                rule.selections.forEach(sel => {
                    slots.push({ value: sel, label: getSpellName(sel), ruleId: rule.id })
                })
            })
            setClassSpellSlots(slots)
        })
        getItemChoiceRules(ancestry?.system?.rules ?? []).then(rules => {
            const slots: any[] = []
            rules.forEach(rule => {
                rule.selections.forEach(sel => {
                    slots.push({ value: sel, label: getSpellName(sel), ruleName: rule.label, ruleId: rule.id })
                })
            })
            setAncestrySpellSlots(slots)
        })
        getItemChoiceRules(perks.flatMap(p => p.rules)).then(rules => {
            const slots: any[] = []
            
            setPerkSpellSlots(loadInitialSlots(rules))
        })
    }, [spellsList])

    const getSpellName = (id): string => {
        return spellsList.find(it => it.value === id)?.label ?? 'unk'
    }

    return (
        <div className="space-y-4 overflow-auto p-2">
            <SpellSelection />
        </div>
    )

}