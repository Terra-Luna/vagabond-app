import { Trash } from "lucide-react"
import { useCallback } from "react"

import { StartingPackDataModel } from "../../../../../model/item/equip/StartingPackDataModel"
import { ItemsCache } from "../../../../../rules/util/ItemsCache"
import { useContextMenu } from "../../../../component/ContextMenu"
import { EquipmentSheetSubtypeBody } from "../component/EquipmentSheetSubtypeBody"
import { ItemSheetProperty } from "../component/ItemSheetLabelComponent"

export const StartingPackSheet = ({ item }: { item: Item & { system: StartingPackDataModel } }) => {
    const { ContextMenu, onCtxMenu } = useContextMenu()

    const deleteItem = useCallback(async (index: number) => {
        const updatedItems = [...item.system.consolidatedItems]
        updatedItems.splice(index, 1)
        await item.update({ "system.items": updatedItems } as Record<string, any>)
    }, [item])

    return (
        <EquipmentSheetSubtypeBody>
            <div className="grid grid-cols-2 gap-x-4 items-start">
                {item.system.consolidatedItems.map((it, index) => (
                    <button key={index}
                        onContextMenu={(e) => onCtxMenu(e, [
                            { icon: Trash, label: "Delete", action: () => deleteItem(index), isDestructive: true }
                        ])}
                        onClick={() => {
                        ItemsCache.equipment().find(eq => eq.id === it.id)?.sheet?.render(true)
                    }} className="flex flex-col items-start space-y-1 w-full text-left cursor-pointer hover-glow">
                        <ItemSheetProperty label={it.name} value={`(x ${it.qty})`} />
                    </button>
                ))}
                
                <ContextMenu />
            </div>
        </EquipmentSheetSubtypeBody>
    )
}