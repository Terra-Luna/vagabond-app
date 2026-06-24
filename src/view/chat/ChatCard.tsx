import React from 'react'
import { CritSuccessFail, FavorHinder, SkillCheckResult } from '../../combat/dice-rolls'
import ActorDataModel, { BaseActorSchema } from '../../model/actor/ActorDataModel'
import { getId, getName } from '../../utils/modelUtil'
import { serializeElement } from './ChatCardSerilizer'
import { useContextMenu } from '../component/ContextMenu'
import { Trash } from 'lucide-react'

export const SkillCheckChatCard = ({ portrait, result }: { portrait: string, result: SkillCheckResult }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div
            className="w-full border-2 border-solid rounded-md"
            onContextMenu={(e) => onCtxMenu(e, [
                { icon: Trash, label: 'Delete', action: () => { }, isDestructive: true }
            ])}>
            <div>
                <img className={`bg-transparent object-contain h-[120px] w-[120px]`} src={portrait} alt={'hero'} />
                <div>{result.skillName}</div>
                <div>{result.result}</div>
                <div>d20: {result.d20}</div>
                <div>d6: {result.d6}</div>
                <div>{FavorHinder[result.favorHinder]}</div>
                <div>Total: {result.total}</div>
                <div>vs. {result.difficulty}</div>
            </div>
            <ContextMenu />
        </div>
    )
}

const ResultBanner = ({ result }: { result: CritSuccessFail }) => {
    return (
        <div>

        </div>
    )
}

export const sendVgLiteChatMessage = async (actor: ActorDataModel<BaseActorSchema>, card: React.ReactElement) => {
    const blueprint = serializeElement(card)
    const chatRoot = `<div class="vglite-react-chat-root"/>`
    await ChatMessage.create({
        speaker: { actor: getId(actor), alias: getName(actor) },
        content: chatRoot,
        flags: {
            "vagabond-lite": { blueprint }
        } as any
    })
}