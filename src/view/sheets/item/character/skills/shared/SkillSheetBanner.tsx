import { Pencil, MessageSquareText } from "lucide-react"
import { sendVgLiteChatMessage } from "../../../../../chat/ChatCardManager"
import { useContextMenu, CtxMenuItem } from "../../../../../component/ContextMenu"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { Divider } from "../../../../../component/Header"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { AbilityChatCard } from "../../../../../chat/AbilityChatCard"

export const SkillSheetBanner = ({ skill }) => {
    const { editModeToggleBtn } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()

    const editImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: skill.img as any,
            callback: async (path) => {
                await skill.update({ 'img': path })
            }
        }).render()
    }

    const contextMenuItems: CtxMenuItem[] = []
    contextMenuItems.push(
        { icon: Pencil, label: 'Edit', action: () => editImage() },
        {
            icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(
                null, <AbilityChatCard
                    actorId={skill.actor?.id!}
                    title={skill.name}
                    description={skill.system.description}
                    tokenIds={[]}
                    dmgType={skill.system.damageType ?? 'none'}
                    appliesBurn={skill.system?.appliesBurn ?? false}
                    burnDuration={skill.system?.burnCountdown ?? ''}
            />)
        }
    )
    return (<>
        <div className="flex space-x-1 items-center bg-section-header-fill px-1 font-eskapade font-bold">
            {!skill.img ? <></> :
                <div className="mt-0.5 mb-1 mr-2">
                    <img
                        className={`object-contain border border-solid border-text-header-primary rounded-sm`}
                        width={56}
                        height={56}
                        src={skill.img}
                        alt={''}
                        onContextMenu={(e) => onCtxMenu(e, contextMenuItems)}
                    />
                    <ContextMenu />
                </div>
            }
            <div className="flex gap-x-1 w-full items-center text-2xl text-text-section-header">
                <EditableTextField
                    boundValue={skill.name}
                    updateProps={{ object: skill, path: ['name'] }}
                    placeholder={"Item name..."}
                />
                <Divider />
                {editModeToggleBtn}
            </div>
        </div>
    </>)
}