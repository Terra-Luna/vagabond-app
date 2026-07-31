import React, { createElement } from "react"
import { ComponentRegistry } from "../component/ComponentRegistry"

export const RehydratedChatCard = React.memo(({ blueprint }: any) => {
    return <>{rehydrateElement(blueprint)}</>
}, (prevProps, nextProps) => {
    return prevProps.blueprint?.id === nextProps.blueprint?.id
})

function rehydrateElement(blueprint: any): React.ReactNode {
    if (!blueprint || typeof blueprint !== 'object') return blueprint
    if (!blueprint.type) return null

    let children: any = null
    if (blueprint.props?.children) {
        if (Array.isArray(blueprint.props.children)) {
            children = blueprint.props.children.map((child: any) => rehydrateElement(child))
        } else if (typeof blueprint.props.children === 'object') {
            children = rehydrateElement(blueprint.props.children)
        } else {
            children = blueprint.props.children
        }
    }

    const registryKey = blueprint.type as keyof typeof ComponentRegistry
    const ResolvedComponent = ComponentRegistry[registryKey]

    const FinalType = ResolvedComponent || blueprint.type.toLowerCase()

    const { children: _, ...cleanProps } = blueprint.props || {}

    return createElement(FinalType as any, cleanProps, children)
}