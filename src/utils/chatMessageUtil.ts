import { getId, getName } from "./modelUtil"
import { serializeElement } from "../view/chat/ChatCardManager"
import { CountdownResult } from "../combat/dice-rolls"
import { createElement } from "react"
import { CountdownRollChatCard } from "../view/chat/CountdownRollChatCard"

export const sendVgLiteChatMessage = async (
    actor: any,
    card: React.ReactElement,
    rolls: any[] = []
) => {
    const blueprint = serializeElement(card)
    const chatRoot = `<div class="vglite-react-chat-root"/>`
    await ChatMessage.create({
        speaker: { actor: getId(actor), alias: getName(actor) },
        content: chatRoot,
        rolls: rolls,
        flags: {
            "vagabond-lite": { blueprint }
        } as any
    })
}

export function sendCountdownRollMessage(cdRes: CountdownResult | null) {
    if (!cdRes) return
    sendVgLiteChatMessage(null, createElement(CountdownRollChatCard, { result: cdRes }))
}