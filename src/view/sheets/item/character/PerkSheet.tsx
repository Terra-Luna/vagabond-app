const { api, sheets } = foundry.applications;
import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";
import PerkDataModel from "../../../../model/item/character/PerkDataModel";

// @ts-expect-error
export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

const PerkReactComponent = ({ item }: { item: FoundryItem<PerkDataModel> }) => {
    const perk = item.system
    return (
        <div id="perk-sheet-div">
            <ItemSheetHeader item={perk}/>
        </div>
    )
}