import { StartingPackDataModel } from "../../../../../model/item/equip/StartingPackDataModel"
import { ItemsCache } from "../../../../../rules/util/ItemsCache"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemSheetProperty } from "../component/ItemSheetLabelComponent"

export const StartingPackSheet = ({ item }: { item: Item & { system: StartingPackDataModel } }) => {
    return (
        <EquipmentSheetSubtypeBody>
            <div className="grid grid-cols-2 gap-x-4 items-start">
                {item.system.consolidatedItems.map((it, index) => (
                    <button key={index} onClick={() => {
                        ItemsCache.equipment().find(eq => eq.id === it.id)?.sheet?.render(true)
                    }} className="flex flex-col items-start space-y-1 w-full text-left cursor-pointer hover-glow">
                        <ItemSheetProperty label={it.name} value={`(x ${it.qty})`} />
                    </button>
                ))}
            </div>
        </EquipmentSheetSubtypeBody>
    )
}