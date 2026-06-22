import lang from "../../../../../../public/lang/en.json"
import { Collapsible } from "../../../../component/Collapsible"
import { Trait as TraitModel, Grant, Modifier } from "../../../../../model/item/character/traitsAndFeatures"
import { CardHeader } from "../../../../component/CardHeader"
import { LabelledField } from "../../../../component/LabelledField"
import { EditableTextField } from "../../../../component/EditableTextField"
import { RichTextField } from "../../../../component/RichTextField"
import { DropDown } from "../../../../component/Dropdown"
import AncestryDataModel from "../../../../../model/item/character/AncestryDataModel"
import { updateDocument } from "../../../../../utils/documentUtils"
import { useCallback, useEffect } from "react"
import { createDropdownEntries, createStatDropdownEntries } from "../../../../../utils/localeUtils"

const locale = lang.VGLITE.AncestrySheet
interface TypedTrait { name: string; description: string }

const addNewBlankModifier = (ancestry: AncestryDataModel, traitIdx) => {
    const modifiers = foundry.utils.deepClone(ancestry.traits[traitIdx].modifiers)

    modifiers.push({ targetStat: "MIT", type: "BONUS", value: "0" })
    ancestry.updateTraitValue("modifiers", modifiers, traitIdx)
}

const addNewBlankGrant = (ancestry: AncestryDataModel, traitIdx) => {
    const grants = foundry.utils.deepClone(ancestry.traits[traitIdx].grants)
    grants.push({ count: 1, ignorePrerequisites: false, type: "PERK", perkOptions: [], spellOptions: [], trainingOptions: [] })
    ancestry.updateTraitValue("grants", grants, traitIdx)
}

export const Trait = ({ trait, startExpanded = false, ancestry, index }: { trait: TraitModel, startExpanded?: boolean, ancestry: AncestryDataModel, index: number }) => {
    const typedTrait = trait as unknown as TypedTrait
    const { name } = typedTrait

    useEffect(() => {
        if (!trait.modifiers || (trait.modifiers as any).length === 0) {
            addNewBlankModifier(ancestry, index)
        }
        if (!trait.grants || (trait.grants as any).length === 0) {
            addNewBlankGrant(ancestry, index)
        }
    }, [ancestry, trait])

    const onUpdateName = useCallback((newName) => {
        return ancestry.updateTraitValue("name", newName, index)
    }, [ancestry, index])

    const onUpdateDescription = useCallback((newDesc) => {
        return ancestry.updateTraitValue("description", newDesc, index)
    }, [ancestry, index])

    return (
        <Collapsible
            className="bg-sheet-header-fill text-text-header-primary"
            title={name}
            startCollapsed={!startExpanded}
            Header={CardHeader}
            content={(
                <div className="mx-2 flex flex-col gap-4">
                    <div>
                        <LabelledField className="font-paradigm" label={locale.name}>
                            <div className="font-eskapade text-2xl">
                                <EditableTextField boundValue={name} onSave={onUpdateName} />
                            </div>
                        </LabelledField>
                    </div>

                    <div>
                        <LabelledField label={lang.VGLITE.AncestrySheet.description}>
                            <RichTextField defaultValue={trait.description} onChange={onUpdateDescription} className="text-text-header-primary" />
                        </LabelledField>
                    </div>

                    <div>
                        {trait.modifiers?.map((mod, modIdx) => (
                            <Modifier key={'mod' + modIdx}
                                ancestry={ancestry}
                                modifier={mod}
                                startExpanded={false}
                                index={modIdx}
                                traitIndex={index}
                            />)
                        )}
                    </div>
                </div>
            )} />
    )
}

interface ModifierProps {
    modifier: Modifier,
    startExpanded?: boolean,
    ancestry: AncestryDataModel,
    index: number,
    traitIndex: number
}

const Modifier = ({ modifier, startExpanded = false, ancestry, index, traitIndex }: ModifierProps) => {

    const updateModifier = useCallback((propName: string, value: any) => {
        return ancestry.updateModifierValue(propName, value, traitIndex, index)
    }, [ancestry, traitIndex, index])

    const onUpdateTargetStat = useCallback((val) => updateModifier("targetStat", val), [updateModifier])
    const onUpdateType = useCallback((val) => updateModifier("type", val), [updateModifier])
    const onUpdateValue = useCallback((val) => updateModifier("value", val), [updateModifier])

    return <div className="pb-2 flex justify-around">
        <DropDown label={lang.VGLITE.AncestrySheet.targetStat}
            options={createDropdownEntries(lang.VGLITE.Modifiers.TargetStat)}
            parent={ancestry.parent}
            updateMechanism={{ onChange: onUpdateTargetStat }}
            value={modifier.targetStat} />
        <DropDown label={lang.VGLITE.AncestrySheet.type}
            options={createDropdownEntries(lang.VGLITE.Modifiers.ModifierTypes)}
            parent={ancestry.parent}
            updateMechanism={{ onChange: onUpdateType }}
            value={modifier.type} />
        <LabelledField label={lang.VGLITE.AncestrySheet.value}>
            <div className="text-lg text-center">
                <EditableTextField boundValue={modifier.value} onSave={onUpdateValue} />
            </div>
        </LabelledField>
    </div>
}