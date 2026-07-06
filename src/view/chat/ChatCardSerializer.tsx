import React, { Component, FunctionComponent } from "react"
import { createElement, ReactElement } from "react"
import { CountdownResult } from "../../combat/dice-rolls"
import { getId, getName } from "../../utils/modelUtil"

interface ElementBlueprint {
    type: string
    props: {
        children?: ElementBlueprint | ElementBlueprint[] | string | number
        [key: string]: any
    }
}

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

export function sendCountdownRollMessage(cdRes: CountdownResult | null, Component: FunctionComponent<{ result: CountdownResult }>) {
    if (!cdRes) return
    sendVgLiteChatMessage(null, createElement(Component, { result: cdRes }))
}

// Recursively converts a live ReactElement tree into serializable JSON
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