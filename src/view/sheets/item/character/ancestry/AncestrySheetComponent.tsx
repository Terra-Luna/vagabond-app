
import { LucidePlus } from "lucide-react";
import { useCallback, useEffect } from "react";
import { AncestryDataModel } from "../../../../../model/item/character/AncestryDataModel";
import { updateDocument } from "../../../../../utils/documentUtils";
import { createDropdownEntries } from "../../../../../utils/localeUtils";
import { PrimaryButton } from "../../../../component/Button";
import { DropDown } from "../../../../component/Dropdown";
import { EditableNameField } from "../../../../component/EditableTextField";
import { LabelledField } from "../../../../component/LabelledField";
import { RichTextField } from "../../../../component/RichTextField";
import { SheetHeader } from "../../../../component/SheetHeader";
import { useEditMode } from "../../../../context/EditModeContext/Hooks";
import { addNewBlankGrant, addNewBlankModifier } from "./utils";
import { Trait } from "./Trait";
import { lang } from "../../../../../utils/lang";

interface AncestryComponentProps {
    ancestry: AncestryDataModel
}

export const AncestryReactComponent = ({ item }: { item: Item & { system: AncestryDataModel } }) => {
    const ancestry = item.system

    const onDescriptionChange = useCallback((val) => {
        updateDocument(ancestry.parent, { 'description': val })
    }, [ancestry])

    return (
        <div className="flex flex-col grow min-h-0 overflow-y-auto">
            <AncestrySheetHeader {...{ ancestry }} />
            <div className="ml-2 mt-1 mr-2">
                <div className="pb-1 border border-dotted border-transparent border-b-table-border">
                    <LabelledField variant="alternate" label={lang.VGLITE.AncestrySheet.description} className="text-text-primary font-paradigm">
                        <RichTextField defaultValue={ancestry.description} onChange={onDescriptionChange} height={100} />
                    </LabelledField>
                </div>
                <Traits ancestry={ancestry} />
            </div>
        </div>
    )
}

const addNewBlankTrait = async (ancestry: AncestryDataModel) => {
    const traits = foundry.utils.deepClone(ancestry.traits)
    traits.push({ name: lang.VGLITE.AncestrySheet.newTrait } as any)
    const newAncestry = (await updateDocument(ancestry.parent, { traits })).system

    addNewBlankGrant(newAncestry, traits.length - 1).then(updated => addNewBlankModifier(updated.system, traits.length - 1))
}

const Traits = ({ ancestry }: { ancestry: AncestryDataModel }) => {
    const { isEditMode } = useEditMode()
    const addTrait = useCallback(() => {
        addNewBlankTrait(ancestry)
    }, [ancestry])

    // Add a new trait if the ancestry doesn't have any
    useEffect(() => {
        if (ancestry.traits.length === 0) {
            addTrait()
        }
    }, [addTrait])

    return <div className="mt-2 pb-2">
        <div className="flex text-2xl justify-between">
            {lang.VGLITE.AncestrySheet.traits}
            {isEditMode ? <PrimaryButton children={lang.VGLITE.AncestrySheet.addTrait} icon={<LucidePlus />} onClick={addTrait} /> : undefined}
        </div>
        <div className="flex flex-col gap-4 mt-2">
            {ancestry.traits.map((trait, idx) => (
                <Trait
                    trait={trait as any}
                    key={"trait" + idx}
                    ancestry={ancestry}
                    index={idx}
                    startExpanded={ancestry.traits.length === 1} />
            ))}</div>
    </div>
}

const AncestrySheetHeader = ({ ancestry }: AncestryComponentProps) => {
    const { editModeToggleBtn } = useEditMode()
    return <SheetHeader name={
        <div className="flex">
            <EditableNameField actor={ancestry.parent} />
            <div className="ml-auto mt-2">{editModeToggleBtn}</div>
        </div>
    } subtitle={
        <>
            <div className="text-text-section-header flex gap-2">
                <DropDown label={lang.VGLITE.ItemSheet.size}
                    variant="alternate"
                    options={createDropdownEntries(lang.VGLITE.Sizes)}
                    parent={ancestry.parent}
                    updateMechanism={{ updatePath: ['beingSize'] }}
                    value={ancestry.beingSize} />
                <DropDown label={lang.VGLITE.ItemSheet.type}
                    variant="alternate"
                    options={createDropdownEntries(lang.VGLITE.BeingTypes)}
                    parent={ancestry.parent}
                    updateMechanism={{ updatePath: ['beingType'] }}
                    value={ancestry.beingType} />
            </div>
        </>
    } />
}