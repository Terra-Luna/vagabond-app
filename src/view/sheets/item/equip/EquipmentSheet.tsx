import EquipmentDataModel, { EquipmentSchema } from "../../../../model/item/equip/EquipmentDataModel";
import { FoundryItem, ItemSheetHeader, VgLiteItemSheet } from "../VgLiteItemSheet";

export abstract class EquipmentSheet extends VgLiteItemSheet {
    Component = EquipmentReactComponent
    abstract SubTypeComponent: React.ComponentType<any>

    override getReactProps() {
        return {
            ...super.getReactProps(),
            SubTypeComponent: this.SubTypeComponent
        }
    }
}

const EquipmentReactComponent = ({ item, SubTypeComponent }: { item: FoundryItem<EquipmentDataModel<EquipmentSchema>>, SubTypeComponent: () => React.ReactNode }) => {
    const equip = item.system
    return (
        <div id="equip-sheet-div">
            <ItemSheetHeader item={equip} />
            <SubTypeComponent/>
        </div>
    )
}