import { ReactNode, useCallback, useEffect, useState } from "react"

import { AncestryDataModel } from "../../../model/item/character/AncestryDataModel"
import { appLang } from "../../../utils/lang"
import { CombinedItems, getFullItem, TypedIndexEntry } from "../../../utils/modelUtil"
import { Checkbox } from "../../../view/component/Checkbox"
import { Header } from "../../../view/component/Header"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { AncestryReactComponent } from "../../../view/sheets/item/character/ancestry/AncestrySheetComponent"
import { HeroCreationDropdown } from "../component/HeroCreationDropdown"
import { TopNavButtons } from "../component/TopNavButtons"

export const useAncestrySelection = (navButtons: ReactNode[]) => {

    useEffect(() => {
        CombinedItems('ancestry').then((res) => {
            const sortedAncestries = res.sort((a, b) => a.name.localeCompare(b.name))
            setAncestries(sortedAncestries)
            setAncestryOptions([
                { value: null, label: " -- Select your Ancestry -- " },
                ...sortedAncestries.map(it => ({ value: it._id, label: it.name }))
            ])
        })
    }, [])

    const [levelZero, setLevelZero] = useState(false)
    const [ancestries, setAncestries] = useState<(Item | TypedIndexEntry)[]>()
    const [ancestryOptions, setAncestryOptions] = useState<{ value: string | null, label: string }[]>()
    const [ancestryItem, setAncestryItem] = useState<Item & { system: AncestryDataModel | null }>()
    const [miscAncestryChoiceRules, setMiscAncestryChoiceRules] = useState<any>(null)
    const [selectedAncestryMiscChoices, setSelectedAncestryMiscChoices] = useState<{ [ruleId: string]: string }>({})

    const onSelectAncestry = useCallback(async (selection: string) => {
        const item = await getFullItem<AncestryDataModel>(ancestries?.find(it => it._id === selection) ?? null)
        if (item) setAncestryItem(item)
        setSelectedAncestryMiscChoices({})
        setMiscAncestryChoiceRules(item?.system?.rules?.filter(r =>
            r.key === "ChoiceSet" &&
            r.channel === "path" &&
            (r.choices as any[])?.some(choice => !choice.value.includes("skills.")) &&
            (r.choices as any[])?.some(choice => !choice.value.includes("stats."))
        ))
    }, [ancestries])

    const onSelectAncestryChoice = useCallback((ruleId: string, choiceValue: string) => {
        setSelectedAncestryMiscChoices(prev => {
            const next = { ...prev }
            if (choiceValue) next[ruleId] = choiceValue
            else delete next[ruleId]
            return next
        })
    }, [])

    const AncestrySelection = (
        <div className="bg-sheet-main-fill flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-shrink-0 space-y-4">
                <Header title={appLang.HeroCreation.identity} />
                <TopNavButtons navButtons={navButtons} canProceed={!!ancestryItem && (!miscAncestryChoiceRules || Object.keys(selectedAncestryMiscChoices).length === miscAncestryChoiceRules.length)} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="flex gap-x-2 items-end">
                    <HeroCreationDropdown
                        label={appLang.HeroCreation.selectAncestry}
                        value={ancestryItem?.id ?? appLang.HeroCreation.selectAncestry}
                        options={ancestryOptions ?? []}
                        onChange={(val) => onSelectAncestry(val)}
                    />

                    {miscAncestryChoiceRules &&
                        <div className="flex gap-x-2">
                            {miscAncestryChoiceRules.map((rule, index) => (
                                <HeroCreationDropdown
                                    key={index}
                                    label={rule.label}
                                    value={selectedAncestryMiscChoices[rule.id] ?? null}
                                    options={[{ value: null, label: "-" }, ...rule.choices.map((choice) => ({ value: choice.value, label: choice.label }))]}
                                    onChange={(val) => onSelectAncestryChoice(rule.id, val)}
                                />
                            ))}
                        </div>
                    }

                    {/* LEVEL ZERO START TOGGLE */}
                    <div className="ml-auto mr-2">
                        <Checkbox
                            label={"Start at Level 0"}
                            checked={levelZero}
                            onCheckedChanged={(val) => setLevelZero(val)}
                        />
                    </div>
                </div>
                {ancestryItem &&
                    <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                        <AncestryReactComponent item={ancestryItem} />
                    </EditModeContextProvider>
                }
            </div>
        </div>
    )

    return { AncestrySelection, ancestryItem, levelZero, selectedAncestryMiscChoices, setSelectedAncestryMiscChoices }
}