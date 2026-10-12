import { sys_id } from "../../utils/foundryUtils"
import { getId, getName } from "../../utils/modelUtil"
import type { InlineRollData } from "./InlineRollChatCard"

interface ElementBlueprint {
    type: string
    props: {
        children?: ElementBlueprint | ElementBlueprint[] | string | number
        [key: string]: any
    }
}

export const sendVagabondChatCard = async (
    actor: any,
    type: string,
    props: Record<string, any>,
    rolls: any[] = []
) => {
    const blueprint: ElementBlueprint = { type, props }
    const chatRoot = `<div class="vagabond-react-chat-root"/>`
    await ChatMessage.create({
        speaker: { actor: getId(actor), alias: getName(actor) },
        content: chatRoot,
        rolls,
        flags: { [sys_id]: { blueprint } } as any
    })
}

const CHAT_ROOT = `<div class="vagabond-react-chat-root"/>`

/**
 * Converts raw Foundry messages (inline rolls, user-typed text) into blueprint
 * messages before creation so they render like every other custom chat card.
 * This prevents us having to duplicate all our chat root shadow dom logic.
 */
export const serializeRawChatMessage = (message: any) => {
    if (message.getFlag?.(sys_id, "blueprint")) return

    const hasRolls = !!message.rolls?.length
    const isUserText = [1, 2, 3].includes(message.style ?? message.type)
    if (!hasRolls && !isUserText) return

    const rolls: InlineRollData[] = (message.rolls ?? []).map((roll: any) => ({
        formula: roll.formula,
        total: roll.total,
        terms: roll.terms.map((term: any) => ({
            faces: term.faces,
            results: Array.isArray(term.results)
                ? term.results.map((r: any) => ({
                    result: r.result,
                    discarded: r.discarded === true,
                    exploded: !!r.exploded,
                    rerolled: !!r.rerolled
                }))
                : undefined,
            expression: term.expression ?? term.formula
        }))
    }))

    const blueprint: ElementBlueprint = {
        type: "InlineRollChatCard",
        props: {
            actorId: message.speaker?.actor ?? message.author?.character?.id,
            userId: message.author?.id,
            alias: message.speaker?.alias || message.author?.name || "",
            flavor: message.flavor,
            whisper: Array.from(message.whisper ?? []),
            blind: !!message.blind,
            rolls,
            textHtml: message.content
        }
    }

    message.updateSource({
        content: CHAT_ROOT,
        flags: { [sys_id]: { blueprint } }
    })
}