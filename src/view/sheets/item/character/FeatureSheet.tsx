const { api, sheets } = foundry.applications;
import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";
import FeatureDataModel from "../../../../model/item/character/traitsAndFeatures";

// @ts-expect-error
export class PerkSheet extends VgLiteItemSheet {
    Component = PerkReactComponent
}

const PerkReactComponent = ({ item }: { item: FoundryItem<FeatureDataModel> }) => {
    const feature = item.system
    return (
        <div id="feature-sheet-div">
            <ItemSheetHeader item={feature}/>
        </div>
    )
}