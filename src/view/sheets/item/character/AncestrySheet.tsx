import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";
import AncestryDataModel from "../../../../model/item/character/AncestryDataModel";

export class AncestrySheet extends VgLiteItemSheet {
    Component = AncestryReactComponent
}

const AncestryReactComponent = ({ item }: { item: FoundryItem<AncestryDataModel> }) => {
    const ancestry = item.system
    return (
        <div id="ancestry-sheet-div">
            <ItemSheetHeader item={ancestry}/>
        </div>
    )
}