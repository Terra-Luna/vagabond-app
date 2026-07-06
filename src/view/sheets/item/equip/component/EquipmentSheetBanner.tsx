import { Pencil, MessageSquareText } from "lucide-react"
import { EquipmentDataModel, EquipmentSchema } from "../../../../../model/item/equip/EquipmentDataModel"
import { getId } from "../../../../../utils/modelUtil"
import { ItemChatCard } from "../../../../chat/ItemChatCard"
import { useContextMenu, CtxMenuItem } from "../../../../component/ContextMenu"
import { EditableTextField } from "../../../../component/EditableTextField"
import { Divider } from "../../../../component/Header"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { sendVgLiteChatMessage } from "../../../../../utils/chatMessageUtil"

export const EquipmentSheetBanner = ({ item }: { item: Item & { system: EquipmentDataModel<EquipmentSchema> } }) => {
    const { editModeToggleBtn } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()

    const editImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: item.img as any,
            callback: async (path) => {
                await item.update({ 'img': path })
            }
        }).render()
    }

    const contextMenuItems: CtxMenuItem[] = []
    contextMenuItems.push(
        { icon: Pencil, label: 'Edit', action: () => editImage() },
        {
            icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(
                null, <ItemChatCard itemId={getId(item)} itemName={item.name} />
            )
        }
    )
    return (<>
        <div className="flex space-x-1 items-center bg-section-header-fill px-1 font-eskapade font-bold">
            {item.img == null ? <></> :
                <div className="mt-0.5 mb-1 mr-2">
                    <img
                        className={`object-contain border border-solid border-text-header-primary rounded-sm`}
                        width={56}
                        height={56}
                        src={item.img}
                        alt={''}
                        onContextMenu={(e) => onCtxMenu(e, contextMenuItems)}
                    />
                    <ContextMenu />
                </div>
            }
            <div className="flex gap-x-1 w-full items-center text-2xl text-text-section-header">
                <EditableTextField
                    boundValue={item.name}
                    updateProps={{ object: item, path: ['name'] }}
                    placeholder={"Item name..."}
                />
                <Divider />
                {editModeToggleBtn}
            </div>
        </div>
    </>)
}