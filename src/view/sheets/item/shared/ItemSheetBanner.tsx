import { MessageSquareText } from "lucide-react"

import { AncestryDataModel, ancestrySizeAndType } from "../../../../model/item/character/AncestryDataModel"
import { PerkDataModel, perkPrerequisites } from "../../../../model/item/character/PerkDataModel"
import { spellDamageBase,SpellDataModel } from "../../../../model/item/character/SpellDataModel"
import { appLang } from "../../../../utils/lang"
import { AbilityChatCard } from "../../../chat/AbilityChatCard"
import { sendVagabondChatMessage } from "../../../chat/ChatCardSerializer"
import { CtxMenuItem,useContextMenu } from "../../../component/ContextMenu"
import { EditableTextField } from "../../../component/EditableTextField"
import { Divider } from "../../../component/Header"
import { CardSubHeader, CardSubHeaderValues } from "../../../component/SkillCard"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { useImageEdit } from "../../shared/ImageEditUseCase"

export const ItemSheetBanner = ({ item, hideImage }: { item: Item & { system: any }, hideImage?: boolean }) => {
    const { editModeToggleBtn } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(item)

    const contextMenuItems: CtxMenuItem[] = []
    contextMenuItems.push(
        {
            icon: MessageSquareText,
            label: appLang.ButtonActions.chat,
            action: () => {
                sendVagabondChatMessage(
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
                    <div className="flex flex-col">
                        <EditableTextField
                            boundValue={item.name}
                            updateProps={{ object: item, path: ['name'] }}
                            placeholder={appLang.ItemSheet.placeholder_name}
                        />
                    </div>
                    <Divider />
                    {editModeToggleBtn}
                </div>
            </div>
            <CardSubHeader values={subheaderContent} showRightBorder={false} />
        </div>
    )
}