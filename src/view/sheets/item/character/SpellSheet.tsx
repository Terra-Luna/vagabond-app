const { api, sheets } = foundry.applications;
import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";
import SpellDataModel from "../../../../model/item/character/SpellDataModel";

// @ts-expect-error
export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

const PerkReactComponent = ({ item }: { item: FoundryItem<SpellDataModel> }) => {
    const spell = item.system
    return (
        <div id="spell-sheet-div">
            <ItemSheetHeader item={spell}/>
        </div>
    )
}