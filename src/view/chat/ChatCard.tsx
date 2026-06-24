import React from 'react'
import { CritSuccessFail, SkillCheckResult } from '../../combat/dice-rolls'
import ActorDataModel, { BaseActorSchema } from '../../model/actor/ActorDataModel'
import { getId, getName } from '../../utils/modelUtil'
import { serializeElement } from './ChatCardSerilizer'

export const SkillCheckChatCard = ({ portrait, result }: { portrait: string, result: SkillCheckResult }) => {
    return (
        <div>
            <img src={portrait} />
            <div>{result.skillName}</div>
            <div>{result.result}</div>
            <div>{result.d20}</div>
            <div>{result.d6}</div>
            <div>{result.favorHinder}</div>
            <div>{result.total}</div>
            <div>{result.difficulty}</div>
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
    //const uuid = crypto.randomUUID()
    const chatRoot = `<div class="vglite-react-chat-root"/>`
    await ChatMessage.create({
        speaker: { actor: getId(actor), alias: getName(actor) },
        content: chatRoot,
        flags: {
            "vagabond-lite": { blueprint }
        } as any
    })

    /* Hooks.once("renderChatMessageHTML", (app, html, msgData) => {
        if (!message || !msgData || msgData.message._id !== message.id) return
        const container = html.querySelector(`.vglite-react-chat-root`)
        if (container) {
            createRoot(container).render(card)
        }
    }) */

}