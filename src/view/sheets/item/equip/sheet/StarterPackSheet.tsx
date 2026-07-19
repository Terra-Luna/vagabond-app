import { StarterPackDataModel } from "../../../../../model/item/equip/StarterPackDataModel"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemSheetProperty } from "../component/ItemSheetLabelComponent"

export const StarterPackSheet = ({ item }: { item: Item & { system: StarterPackDataModel } }) => {
    const pack = item.system
    return (
        <EquipmentSheetSubtypeBody>
            <div>
                {
                    pack.items.map(it => (
                        <div key={it.id}>
                            <ItemSheetProperty label={it.name} value={`(x ${it.qty})`} />
                        </div>
                    ))
                }
            </div>
        </EquipmentSheetSubtypeBody>
    )
}