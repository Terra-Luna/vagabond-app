/* eslint-disable react-refresh/only-export-components */
import React, { createElement, ReactNode, useEffect, useRef } from "react"
import { ComponentRegistry } from "../component/ComponentRegistry"

export const RehydratedChatCard = React.memo(({ blueprint }: any) => {
    return <>{rehydrateElement(blueprint, true)}</>
}, (prevProps, nextProps) => {
    return prevProps.blueprint?.id === nextProps.blueprint?.id
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

    if (isRoot) {
        return <SmartScrollWrapper children={renderedElement} />
    }
    else {
        return renderedElement
    }
}

/**
 * Foundry can't recognize our chat card heights as they're rehydrated. This side-effect
 * will trigger an auto-scroll-to-bottom function provided by Foundry's API after hydration
 * takes place.
 * @param param0 
 * @returns 
 */
const SmartScrollWrapper = ({ children }: { children: ReactNode }) => {
    const localRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!document.querySelector('div.chat-scroll[data-application-part="log"]')) return

        const observer = new MutationObserver(() => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    if (!ui || !ui.chat) return
                    (ui.chat as any).scrollBottom({ popout: true })
                })
            }, 50)
        })

        if (localRef.current) {
            observer.observe(localRef.current, {
                childList: true,
                subtree: true,
                attributes: true
            })
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div ref={localRef} className="w-full h-auto min-h-fit block clear-both overflow-visible">
            {children}
        </div>
    )
}