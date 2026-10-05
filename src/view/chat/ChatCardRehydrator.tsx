/* eslint-disable react-refresh/only-export-components */
import React, { createElement, ReactNode, useEffect, useRef } from "react"

import { ComponentRegistry } from "../component/ComponentRegistry"

export const RehydratedChatCard = React.memo(({ blueprint, messageId }: { blueprint: any, messageId: string }) => {
    const [subRev, setSubRev] = React.useState(0)

    /**
     * Listens to a few Foundry hooks to determine when its necessary to be
     * rendering chat cards. Some dependencies exist for interactive chat
     * cards as well as cards related to Actors and/or Items.
     */
    useEffect(() => {
        const triggerUpdate = () => setSubRev(p => p + 1)
        const chatHook = Hooks.on("updateChatMessage", (msg: any) => {
            if (msg.id === messageId) triggerUpdate()
        })
        if (game.ready) {
            triggerUpdate()
        }
        else {
            Hooks.once("ready", triggerUpdate)
            Hooks.once("canvasReady", triggerUpdate)
        }
        return () => {
            Hooks.off("updateChatMessage", chatHook)
        }
    }, [messageId])

    return <div key={`${blueprint?.id || 'card'}-${subRev}`}>{rehydrateElement(blueprint, true)}</div>
}, (prevProps, nextProps) => {
    return prevProps.blueprint?.id === nextProps.blueprint?.id && prevProps.messageId === nextProps.messageId
})

export function rehydrateElement(blueprint: any, isRoot = true): React.ReactNode {
    if (!blueprint || typeof blueprint !== 'object') return blueprint
    if (!blueprint.type) return null

    let children: any = null
    if (blueprint.props?.children) {
        if (Array.isArray(blueprint.props.children)) {
            children = blueprint.props.children.map((child: any) => rehydrateElement(child, false))
        }
        else if (typeof blueprint.props.children === 'object') {
            children = rehydrateElement(blueprint.props.children, false)
        }
        else {
            children = blueprint.props.children
        }
    }

    const registryKey = blueprint.type as keyof typeof ComponentRegistry
    const ResolvedComponent = ComponentRegistry[registryKey]

    const FinalType = ResolvedComponent || blueprint.type.toLowerCase()
    const { children: _, ...cleanProps } = blueprint.props || {}

    const renderedElement = createElement(FinalType as any, cleanProps, children)
    return isRoot ? <SmartScrollWrapper children={renderedElement} /> : renderedElement
}

/**
 * Foundry can't recognize our chat card heights as they're rehydrated. This side-effect
 * will trigger an auto-scroll-to-bottom function provided by Foundry's API after hydration
 * takes place.
 * @param param0 
 * @returns 
 */
let chatPinnedToBottom = true

let guardInstalled = false

/**
 * Tracks whether the user is at the bottom of the chat log and makes Foundry's own
 * scrollBottom a no-op while they've scrolled up, so new messages don't yank the view.
 */
export function installChatScrollGuard() {
    if (guardInstalled) return
    const chat = ui?.chat as any
    if (!chat) return
    guardInstalled = true

    const proto = Object.getPrototypeOf(chat)
    const original = proto.scrollBottom
    if (typeof original === 'function') {
        proto.scrollBottom = function (...args: any[]) {
            if (!chatPinnedToBottom) return
            return original.apply(this, args)
        }
    }

    let lastInput = 0
    let pointerDown = false
    const markInput = () => { lastInput = performance.now() }
    const isChatLog = (t: EventTarget | null): t is HTMLElement =>
        t instanceof HTMLElement && !!t.closest('#chat, .chat-sidebar, .chat-popout, .chat-log')

    document.addEventListener('wheel', e => { if (isChatLog(e.target)) markInput() }, { capture: true, passive: true })
    document.addEventListener('touchmove', e => { if (isChatLog(e.target)) markInput() }, { capture: true, passive: true })
    document.addEventListener('keydown', e => {
        if (!isChatLog(e.target)) return
        if (e.target.closest('textarea, input, [contenteditable="true"]')) return
        markInput()
    }, true)
    document.addEventListener('pointerdown', e => {
        if (isChatLog(e.target)) { pointerDown = true; markInput() }
    }, true)
    window.addEventListener('pointerup', () => { pointerDown = false }, true)
    document.addEventListener('click', e => {
        if (e.target instanceof Element && e.target.closest('[data-action="jumpToBottom"]')) chatPinnedToBottom = true
    }, true)
    document.addEventListener('scroll', e => {
        const el = e.target
        if (!isChatLog(el) || el.scrollHeight <= el.clientHeight) return
        if (!pointerDown && performance.now() - lastInput > 300) return
        chatPinnedToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    }, { capture: true, passive: true })
}
export const SmartScrollWrapper = ({ children }: { children: ReactNode }) => {
    const localRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let frameId: number | undefined

        const scrollToBottom = () => {
            if (!chatPinnedToBottom) return
            if (frameId !== undefined) cancelAnimationFrame(frameId)
            frameId = requestAnimationFrame(() => {
                frameId = undefined
                if (!chatPinnedToBottom) return
                if (ui?.chat) {
                    (ui.chat as any).scrollBottom({ popout: true })
                }
            })
        }

        const observer = new MutationObserver(() => {
            scrollToBottom()
        })

        if (localRef.current) {
            observer.observe(localRef.current, {
                childList: true,
                subtree: true
            })
        }

        const resizeObserver = typeof ResizeObserver === 'undefined'
            ? undefined
            : new ResizeObserver(scrollToBottom)
        if (localRef.current) resizeObserver?.observe(localRef.current)

        scrollToBottom()
        const timeoutId = window.setTimeout(scrollToBottom, 50)

        return () => {
            observer.disconnect()
            resizeObserver?.disconnect()
            if (frameId !== undefined) cancelAnimationFrame(frameId)
            window.clearTimeout(timeoutId)
        }
    }, [])

    return (
        <div ref={localRef} className="w-full h-auto min-h-fit block clear-both overflow-visible">
            {children}
        </div>
    )
}