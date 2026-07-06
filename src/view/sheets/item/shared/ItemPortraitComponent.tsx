import { Pencil, MessageSquareText } from "lucide-react"
import { getId } from "../../../../utils/modelUtil"
import { sendVgLiteChatMessage } from "../../../chat/ChatCardSerializer"
import { ItemChatCard } from "../../../chat/ItemChatCard"
import { useContextMenu, CtxMenuItem } from "../../../component/ContextMenu"

export const ItemPortraitComponent = ({ item, size=56 }: { item: Item, size?: number }) => {
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

    return (
        <div>
            {item.img == null ? <></> :
                <div className="mt-0.5 mb-1 mr-2">
                    <img
                        className={`object-contain border border-solid border-text-header-primary rounded-sm`}
                        width={size}
                        height={size}
                        src={item.img}
                        alt={''}
                        onContextMenu={(e) => onCtxMenu(e, contextMenuItems)}
                    />
                    <ContextMenu />
                </div>
            }
        </div>
    )
}