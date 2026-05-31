import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";
import AncestryDataModel from "../../../../model/item/character/AncestryDataModel";
import { SheetHeader } from "../../../component/SheetHeader";
import { EditableNameField, EditableTextField } from "../../../component/EditableTextField";
import lang from "../../../../../public/lang/en.json";
import { updateDocument } from "../../../../utils/documentUtils";
import { DropDown } from "../../../component/Dropdown";
import { LabelledField } from "../../../component/LabelledField";
import { RichTextField } from "../../../component/RichTextField";
import { useRef } from "react";

export class AncestrySheet extends VgLiteItemSheet {
    Component = AncestryReactComponent
}

export interface AncestryComponentProps {
    ancestry: AncestryDataModel;
}

const AncestryReactComponent = ({ item }: { item: FoundryItem<AncestryDataModel> }) => {
    const ancestry = item.system
    return (
        <div id="ancestry-sheet-div">
            <AncestrySheetHeader {...{ ancestry }} />
        </div>
    )
}

const AncestrySheetHeader = ({ ancestry }: AncestryComponentProps) => {
    const richTextRef = useRef();

    return <SheetHeader name={
        <EditableNameField actor={ancestry.parent} />
    } subtitle={
        <>
            <div className="vglite-type-size">
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
            <LabelledField label="Sup">
                <RichTextField ref={richTextRef} />
            </LabelledField>
        </>
    } />
}