const { api, sheets } = foundry.applications;
import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";
import ClassDataModel from "../../../../model/item/character/ClassDataModel";

// @ts-expect-error
export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

const PerkReactComponent = ({ item }: { item: FoundryItem<ClassDataModel> }) => {
    const clazz = item.system
    return (
        <div id="class-sheet-div">
            <ItemSheetHeader item={clazz}/>
        </div>
    )
}