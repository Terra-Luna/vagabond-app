import { StarterPackDataModel } from "../../../../../model/item/equip/StarterPackDataModel"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemSheetProperty } from "../component/ItemSheetLabelComponent"

export const StarterPackSheet = ({ item }: { item: Item & { system: StarterPackDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                {
                    item.system.consolidatedItems.map((it, index) => (
                        <div key={index}>
                            <ItemSheetProperty label={it.name} value={`(x ${it.qty})`} />
                        </div>
                    ))
                }
            </div>
        </EquipmentSheetSubtypeBody>
    )
}