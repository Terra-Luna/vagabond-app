import { Pencil, MessageSquareText } from "lucide-react"
import { useContextMenu, CtxMenuItem } from "../../../../../component/ContextMenu"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { Divider } from "../../../../../component/Header"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { AbilityChatCard } from "../../../../../chat/AbilityChatCard"
import { CardSubHeader, CardSubHeaderValues } from "../../../../../component/SkillCard"
import { SpellDataModel, spellDamageBase } from "../../../../../../model/item/character/SpellDataModel"
import { PerkDataModel, perkPrerequisites } from "../../../../../../model/item/character/PerkDataModel"
import { sendVgLiteChatMessage } from "../../../../../chat/ChatCardSerializer"

export const SkillSheetBanner = ({ skill }: { skill: Item & { system: any } }) => {
    const { editModeToggleBtn } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()

    const editImage = () => {
        new foundry.applications.apps.FilePicker({
            type: "image",
            current: skill.img as any,
            callback: async (path) => { await skill.update({ 'img': path }) }
        }).render()
    }

    const contextMenuItems: CtxMenuItem[] = []
    contextMenuItems.push(
        { icon: Pencil, label: 'Edit', action: () => editImage() },
        {
            icon: MessageSquareText, label: 'Send to chat', action: () => sendVgLiteChatMessage(
                null, <AbilityChatCard
                    actorId={skill.actor?.id ?? null}
                    img={skill.img ?? ''}
                    title={skill.name}
                    description={skill.system.description}
                    tokenIds={[]}
                    appliesBurn={skill.system?.appliesBurn ?? false}
                    burnDuration={skill.system?.burnCountdown ?? ''}
                />
            )
        }
    )

    let subheaderContent: CardSubHeaderValues[] = []
    if (skill.system instanceof SpellDataModel) subheaderContent = spellDamageBase(skill.system)
    if (skill.system instanceof PerkDataModel) subheaderContent = perkPrerequisites(skill.system)

    return (
        <div>
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
            <CardSubHeader values={subheaderContent} />
        </div>
    )
}