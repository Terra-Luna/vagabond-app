import { Pencil, MessageSquareText } from "lucide-react"
import { getId } from "../../../../utils/modelUtil"
import { sendVgLiteChatMessage } from "../../../chat/ChatCardSerializer"
import { ItemChatCard } from "../../../chat/ItemChatCard"
import { useContextMenu, CtxMenuItem } from "../../../component/ContextMenu"
import { useImageEdit } from "../../shared/ImageEditUseCase"

export const ItemPortraitComponent = ({ item, size = 56, className }: {
    item: Item, size?: number, className?: string
}) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(item)

    const contextMenuItems: CtxMenuItem[] = []
    contextMenuItems.push(
        {
            icon: MessageSquareText,
            label: 'Send to chat',
            action: () => sendVgLiteChatMessage(null, <ItemChatCard itemId={getId(item)} itemName={item.name} />)
        },
        ...imageEditCtxMenuItems
    )

    return (
        <div>
            {item.img == null ? <></> :
                <div className={`${className ? className : 'mt-0.5 mb-1 mr-2'}`}>
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