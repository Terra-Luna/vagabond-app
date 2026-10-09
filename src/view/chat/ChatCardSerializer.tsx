import { ReactElement } from "react"

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

export const sendVagabondChatMessage = async (
    actor: any,
    card: React.ReactElement,
    rolls: any[] = []
) => {
    const blueprint = serializeElement(card)
    const chatRoot = `<div class="vagabond-react-chat-root"/>`
    await ChatMessage.create({
        speaker: { actor: getId(actor), alias: getName(actor) },
        content: chatRoot,
        rolls: rolls,
        flags: {
            [sys_id]: { blueprint }
        } as any
    })
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

// Converts a live ReactElement tree into serializable JSON
function serializeElement(element: ReactElement): ElementBlueprint {
    const { type, props } = element

    // Resolve component name if it's a functional/class component, otherwise use string tag
    const typeName = typeof type === 'function' ? type.name : (type as string)

    const serializedProps: Record<string, any> = {}

    for (const [key, value] of Object.entries(props as any)) {
        if (key === 'children') {
            if (React.isValidElement(value)) {
                serializedProps.children = serializeElement(value)
            }
            else if (Array.isArray(value)) {
                serializedProps.children = value.map(child =>
                    React.isValidElement(child) ? serializeElement(child) : child
                )
            }
            else {
                serializedProps.children = value // string, number, etc.
            }
        }
        else if (typeof value !== 'function') {
            // Strips out runtime callbacks/functions which cannot be serialized
            serializedProps[key] = value
        }
    }

    return { type: typeName, props: serializedProps }
}