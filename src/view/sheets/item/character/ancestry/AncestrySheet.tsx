import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../../VgLiteItemSheet";
import AncestryDataModel from "../../../../../model/item/character/AncestryDataModel";
import { SheetHeader } from "../../../../component/SheetHeader";
import { EditableNameField, EditableTextField } from "../../../../component/EditableTextField";
import lang from "../../../../../../public/lang/en.json";
import { updateDocument } from "../../../../../utils/documentUtils";
import { DropDown } from "../../../../component/Dropdown";
import { LabelledField } from "../../../../component/LabelledField";
import { RichTextField } from "../../../../component/RichTextField";
import { useRef } from "react";
import { Trait } from "./Trait";

export class AncestrySheet extends VgLiteItemSheet {
    Component = AncestryReactComponent
}

export interface AncestryComponentProps {
    ancestry: AncestryDataModel;
}

const AncestryReactComponent = ({ item }: { item: FoundryItem<AncestryDataModel> }) => {
    const ancestry = item.system
    return (
        <div className="">
            <AncestrySheetHeader {...{ ancestry }} />
            <div className="ml-2 mt-1 mr-2">
                <LabelledField label={lang.VGLITE.AncestrySheet.description} className="text-text-primary font-paradigm">
                    <RichTextField />
                </LabelledField>
                <Traits ancestry={ancestry} />
            </div>
        </div>
    )
}

const Traits = ({ ancestry }: { ancestry: AncestryDataModel }) => {
    let traits
    if (ancestry.traits.length === 0) {
        traits = <Trait trait={{ name: lang.VGLITE.AncestrySheet.newTrait }} startExpanded />
    }
    else {
        traits = ancestry.traits.map(trait => <Trait trait={trait} />)
    }

    return <div className="mt-2">{traits}</div>
}

const AncestrySheetHeader = ({ ancestry }: AncestryComponentProps) => {
    return <SheetHeader name={
        <EditableNameField actor={ancestry.parent} />
    } subtitle={
        <>
            <div className="text-text-header-secondary flex gap-2">
                <DropDown label={lang.VGLITE.ItemSheet.size}
                    options={Object.values(lang.VGLITE.Sizes)}
                    parent={ancestry.parent}
                    updatePath={['beingSize']}
                    value={ancestry.beingSize} />
                <DropDown label={lang.VGLITE.ItemSheet.type}
                    options={Object.values(lang.VGLITE.BeingTypes)}
                    parent={ancestry.parent}
                    updatePath={['beingType']}
                    value={ancestry.beingType} />
            </div>
        </>
    } />
}