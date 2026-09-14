import { useEffect, useMemo, useRef } from "react"

import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import type { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import type { ClassDataModel } from "../../../model/item/character/ClassDataModel"
import { findOrCreateElectiveTrainingsRule, normalizeRuleSelections } from "../../../rules/util/item-rules-util"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { VagabondAppArgs, VagabondApplication } from "../../VagabondApplication"
import { useTrainingSelection } from "./TrainingSelection"

export class TrainingSelectionApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Select Trainings", position: { top: 0 } },
            position: { width: 400, height: 800 },
            Component: () => {
                const dataLoaded = useRef(false)

                const ancestry = actor?.items?.find(i => (i.type as string) === 'ancestry') as (Item & { system: AncestryDataModel }) | undefined
                const clazz = actor?.items?.find(i => (i.type as string) === 'class') as (Item & { system: ClassDataModel }) | undefined
                const stats = useMemo(() => {
                    return Object.keys(actor.system.stats)
                        .filter(key => key !== "baseStatBlock")
                        .map(key => ({ stat: key, value: actor.system.stats[key] }))
                }, [actor.system.stats])

                const { TrainingSelection, chosenTrainings, chosenBonusSkills, electiveTrainingsRuleId, electiveTrainingRules } =
                    useTrainingSelection(ancestry, clazz, stats, [])

                useEffect(() => {
                    if (!dataLoaded.current) {
                        dataLoaded.current = true
                        return
                    }

                    const persistTrainings = async () => {
                        // Class elective trainings
                        if (clazz) {
                            const { rules: classRules, electiveRule } = findOrCreateElectiveTrainingsRule(clazz, {
                                ruleId: electiveTrainingsRuleId,
                                reasonValue: stats.find(s => s.stat === 'reason')?.value ?? 0,
                                template: electiveTrainingRules.find(r => r.id === electiveTrainingsRuleId)
                            })

                            const currentSelections = normalizeRuleSelections(electiveRule.selections)
                            const nextSelections = chosenTrainings.map(t => {
                                const val = `skills.${t.skill}.trained`
                                const existing = currentSelections.find(s => s.value === val)
                                return {
                                    id: existing?.id ?? foundry.utils.randomID(),
                                    value: val,
                                    subselect: ""
                                }
                            })

                            if (JSON.stringify(currentSelections) !== JSON.stringify(nextSelections)) {
                                electiveRule.selections = nextSelections
                                await clazz.update({ "system.rules": classRules } as Record<string, any>)
                            }
                        }

                        // Ancestry bonus trainings
                        if (ancestry) {
                            const ancestryRules = foundry.utils.deepClone(ancestry.system.rules || []) as any[]
                            let hasAncestryChanges = false

                            ancestryRules.forEach(rule => {
                                if (rule.key === "ChoiceSet" && (rule.channel === "path" || rule.choices?.some((c: any) => (typeof c === 'string' ? c : c?.value || '').includes('skills.')))) {
                                    const currentSelections = normalizeRuleSelections(rule.selections)
                                    const nextSelections = chosenBonusSkills
                                        .filter(b => b.ruleId === rule.id)
                                        .map(b => {
                                            const val = `skills.${b.skill}.trained`
                                            const existing = currentSelections.find(s => s.value === val)
                                            return {
                                                id: existing?.id ?? foundry.utils.randomID(),
                                                value: val,
                                                subselect: ""
                                            }
                                        })

                                    if (JSON.stringify(currentSelections) !== JSON.stringify(nextSelections)) {
                                        rule.selections = nextSelections
                                        hasAncestryChanges = true
                                    }
                                }
                            })

                            if (hasAncestryChanges) {
                                await ancestry.update({ "system.rules": ancestryRules } as Record<string, any>)
                            }
                        }

                        await actor.system?.forceUpdate?.()
                    }

                    persistTrainings()
                }, [chosenTrainings, chosenBonusSkills])

                return (
                    <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                        <div className="flex flex-col min-h-0 w-full py-1 px-2 mb-4 overflow-y-auto">
                            {TrainingSelection}
                        </div>
                    </EditModeContextProvider>
                )
            }
        } as VagabondAppArgs)
        this.actor = actor
    }

}