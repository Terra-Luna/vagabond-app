const { api, sheets } = foundry.applications;
import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";
import AncestryDataModel from "../../../../model/item/character/AncestryDataModel";

// @ts-expect-error
export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

const PerkReactComponent = ({ item }: { item: FoundryItem<AncestryDataModel> }) => {
    const ancestry = item.system
    return (
        <div id="ancestry-sheet-div">
            <ItemSheetHeader item={ancestry}/>
        </div>
    )
}