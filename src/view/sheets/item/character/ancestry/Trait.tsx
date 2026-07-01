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
import { ReactNode, useCallback, useEffect } from "react"
import { createDropdownEntries, createStatDropdownEntries } from "../../../../../utils/localeUtils"
import { IconOnlyButton } from "../../../../component/IconOnlyButton"
import { LucidePlus, LucideTrash2 } from "lucide-react"
import { Typography } from "../../../../component/Typography"
import { SingleSelect } from "../../../../component/Toggle"
import { DestructiveButton, PrimaryButton } from "../../../../component/Button"
import { Checkbox } from "../../../../component/Checkbox"

const locale = lang.VGLITE.AncestrySheet
interface TypedTrait { name: string; description: string }

export const addNewBlankModifier = (ancestry: AncestryDataModel, traitIdx) => {
    const modifiers = foundry.utils.deepClone(ancestry.traits[traitIdx].modifiers)

    modifiers.push({ targetStat: "MIT", type: "BONUS", value: "0" })
    return ancestry.updateTraitValue("modifiers", modifiers, traitIdx)
}

export const addNewBlankGrant = (ancestry: AncestryDataModel, traitIdx) => {
    const grants = foundry.utils.deepClone(ancestry.traits[traitIdx].grants)
    grants.push({ count: 1, ignorePrerequisites: false, type: "PERK", perkOptions: [], spellOptions: [], trainingOptions: [] })
    return ancestry.updateTraitValue("grants", grants, traitIdx)
}

export const Trait = ({ trait, startExpanded = false, ancestry, index }: { trait: TraitModel, startExpanded?: boolean, ancestry: AncestryDataModel, index: number }) => {
    const typedTrait = trait as unknown as TypedTrait
    const { name } = typedTrait

    const addModifier = useCallback(() => {
        addNewBlankModifier(ancestry, index)
    }, [ancestry, index])

    const addGrant = useCallback(() => {
        addNewBlankGrant(ancestry, index)
    }, [ancestry, index])

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
                                <EditableTextField boundValue={name || lang.VGLITE.AncestrySheet.newTrait} onSave={onUpdateName} />
                            </div>
                        </LabelledField>
                    </div>

                    <div>
                        <LabelledField label={lang.VGLITE.AncestrySheet.description}>
                            <RichTextField defaultValue={trait.description} className="text-text-header-primary" onChange={onUpdateDescription} height={30} />
                        </LabelledField>
                    </div>

                    {/* Modifiers */}
                    <div className="bg-sheet-main-fill text-text-primary p-4">
                        <div className="flex mb-2 pb-2 border border-dotted border-transparent border-b-table-border justify-between">
                            <Typography variant="subheader">{lang.VGLITE.AncestrySheet.modifiers}</Typography>
                            <PrimaryButton children={lang.VGLITE.AncestrySheet.addModifier} icon={<LucidePlus />} onClick={addModifier} />
                        </div>
                        <div className="flex flex-col gap-2">
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

                    {/* Grants */}
                    <div className="bg-sheet-main-fill text-text-primary p-4">
                        <div className="flex mb-2 pb-2 border border-dotted border-transparent border-b-table-border justify-between">
                            <Typography variant="subheader">{lang.VGLITE.AncestrySheet.grants}</Typography>
                            <PrimaryButton children={lang.VGLITE.AncestrySheet.addGrant} icon={<LucidePlus />} onClick={addGrant} />
                        </div>
                        <div className="flex flex-col gap-2">
                            {trait.grants?.map((grant, grantIdx) => (
                                <Grant key={'grant' + grantIdx}
                                    ancestry={ancestry}
                                    grant={grant}
                                    startExpanded={false}
                                    index={grantIdx}
                                    traitIndex={index}
                                />)
                            )}
                        </div>
                    </div>
                    <div></div>
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

const GrantOrModifier = ({ remove, children }: { remove: () => void; children: ReactNode }) => {
    return (
        <div className="flex border-solid border p-1">
            <div className="flex flex-col justify-center ml-2">
                <DestructiveButton icon={<LucideTrash2 />} onClick={remove} />
            </div>
            <div className="flex flex-col">
                {children}
            </div>
        </div>
    )
}

const Modifier = ({ modifier, startExpanded = false, ancestry, index, traitIndex }: ModifierProps) => {

    const updateModifier = useCallback((propName: string, value: any) => {
        return ancestry.updateModifierValue(propName, value, traitIndex, index)
    }, [ancestry, traitIndex, index])

    const onUpdateTargetStat = useCallback((val) => updateModifier("targetStat", val), [updateModifier])
    const onUpdateType = useCallback((val) => updateModifier("type", val), [updateModifier])
    const onUpdateValue = useCallback((val) => updateModifier("value", val), [updateModifier])
    const removeModifier = useCallback(() => {
        ancestry.removeModifier(modifier, traitIndex)
    }, [modifier, ancestry, traitIndex])

    return (
        <GrantOrModifier remove={removeModifier}>
            <div className="pb-2 flex gap-6 grow ml-4">
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

            </div>
            <div className="flex ml-4 pb-2">
                <LabelledField label={lang.VGLITE.AncestrySheet.value}>
                    <div className="text-lg text-center border border-solid w-full px-1">
                        <EditableTextField boundValue={modifier.value} onSave={onUpdateValue} />
                    </div>
                </LabelledField>
            </div>
        </GrantOrModifier>
    )
}


interface GrantProps {
    grant: Grant,
    startExpanded?: boolean,
    ancestry: AncestryDataModel,
    index: number,
    traitIndex: number
}

const Grant = ({ grant, startExpanded = false, ancestry, index, traitIndex }: GrantProps) => {

    const updateGrant = useCallback((propName: string, value: any) => {
        return ancestry.updateGrantValue(propName, value, traitIndex, index)
    }, [ancestry, traitIndex, index])

    const onUpdateGrantType = useCallback((val) => updateGrant("type", val), [updateGrant])
    const onUpdateDirectOrChoice = useCallback((val) => updateGrant("specific", val === "direct"), [updateGrant])
    const onUpdateCount = useCallback((val) => updateGrant("count", val), [updateGrant])
    const onUpdateIngorePrereqs = useCallback(val => updateGrant("ignorePrerequisites", val), [updateGrant])
    // const onUpdateType = useCallback((val) => updateModifier("type", val), [updateModifier])
    // const onUpdateValue = useCallback((val) => updateModifier("value", val), [updateModifier])
    const removeGrant = useCallback(() => {
        ancestry.removeGrant(grant, traitIndex)
    }, [grant, ancestry, traitIndex])

    return (
        <GrantOrModifier remove={removeGrant}>
            <div className="pb-2 ml-4 flex gap-4 items-center">
                <DropDown label={lang.VGLITE.AncestrySheet.type}
                    options={createDropdownEntries(lang.VGLITE.Grants.Type)}
                    parent={ancestry.parent}
                    updateMechanism={{ onChange: onUpdateGrantType }}
                    value={grant.type} />
                <div className="ml-4 self-end">
                    <SingleSelect
                        options={[{ label: lang.VGLITE.AncestrySheet.direct, value: 'direct' }, { label: lang.VGLITE.AncestrySheet.choice, value: 'choice' }]}
                        setValue={onUpdateDirectOrChoice}
                        value={grant.specific ? "direct" : "choice"} />

                </div>
            </div>
            <div className="ml-4 pb-2">
                {grant.specific ? <DropDown label={lang.VGLITE.AncestrySheet.specificId} options={[{ label: "to do", value: "get all the values" }]} parent={ancestry.parent} updateMechanism={{ onChange: () => { } }} value={"get all the values"} />
                    : (
                        <div className="flex flex-col gap-2">
                            <LabelledField label={lang.VGLITE.AncestrySheet.count}>
                                <div className="flex gap-3">
                                    <div className="text-lg text-center border border-solid px-1">
                                        <EditableTextField boundValue={grant.count as unknown as string} onSave={onUpdateCount} />
                                    </div>
                                    <Checkbox label={lang.VGLITE.AncestrySheet.ignorePrerequisites} checked={!!grant.ignorePrerequisites} onCheckedChanged={onUpdateIngorePrereqs} />
                                </div>
                            </LabelledField>
                            <DropDown label={lang.VGLITE.AncestrySheet.filter} options={[{ label: 'Perk List', value: 'todo' }]} parent={ancestry.parent} updateMechanism={{ onChange: () => { } }} value={'todo'} />
                        </div>
                    )}

            </div>
        </GrantOrModifier>
    )
}

