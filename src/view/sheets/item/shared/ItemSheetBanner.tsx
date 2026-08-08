import { MessageSquareText } from "lucide-react"
import { useContextMenu, CtxMenuItem } from "../../../component/ContextMenu"
import { EditableTextField } from "../../../component/EditableTextField"
import { Divider } from "../../../component/Header"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { AbilityChatCard } from "../../../chat/AbilityChatCard"
import { CardSubHeader, CardSubHeaderValues } from "../../../component/SkillCard"
import { SpellDataModel, spellDamageBase } from "../../../../model/item/character/SpellDataModel"
import { PerkDataModel, perkPrerequisites } from "../../../../model/item/character/PerkDataModel"
import { sendVgLiteChatMessage } from "../../../chat/ChatCardSerializer"
import { vgLiteLang } from "../../../../utils/lang"
import { AncestryDataModel, ancestrySizeAndType } from "../../../../model/item/character/AncestryDataModel"
import { useImageEdit } from "../../shared/ImageEditUseCase"

export const ItemSheetBanner = ({ item, hideImage }: { item: Item & { system: any }, hideImage?: boolean }) => {
    const { editModeToggleBtn } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(item)

    const contextMenuItems: CtxMenuItem[] = []
    contextMenuItems.push(
        {
            icon: MessageSquareText,
            label: vgLiteLang.ButtonActions.chat,
            action: () => {
                sendVgLiteChatMessage(
                    null,
                    <AbilityChatCard
                        actorId={item.actor?.id ?? null}
                        title={item.name}
                        description={item.system.description}
                    />
                )
            }
        },
        ...imageEditCtxMenuItems
    )

    let subheaderContent: CardSubHeaderValues[] = []
    if (item.system instanceof AncestryDataModel) subheaderContent = ancestrySizeAndType(item.system)
    if (item.system instanceof SpellDataModel) subheaderContent = spellDamageBase(item.system)
    if (item.system instanceof PerkDataModel) subheaderContent = perkPrerequisites(item.system)

    return (
        <div>
            <div className="flex gap-x-2 items-center bg-section-header-fill px-1 font-eskapade font-bold">
                {item.img && !hideImage &&
                    <div className="mt-0.5 mb-1">
                        <img
                            className={`object-contain border border-solid border-text-header-primary rounded-sm bg-white`}
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
                        placeholder={vgLiteLang.ItemSheet.placeholder_name}
                    />
                    <Divider />
                    {editModeToggleBtn}
                </div>
            </div>
            <CardSubHeader values={subheaderContent} showRightBorder={false} />
        </div>
    )
}