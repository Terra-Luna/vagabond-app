import React, { ReactElement } from "react"
import { ComponentRegistry } from "../../ComponentRegistry"

interface ElementBlueprint {
    type: string
    props: {
        children?: ElementBlueprint | ElementBlueprint[] | string | number
        [key: string]: any
    }
}

// Recursively converts a live ReactElement tree into serializable JSON
export function serializeElement(element: ReactElement): ElementBlueprint {
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

export function rehydrateElement(blueprint: any): React.ReactNode {
    if (!blueprint || typeof blueprint !== 'object') return blueprint
    if (!blueprint.type) return null

    // 1. Resolve children recursively
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

    // 2. FORCE PascalCase formatting variable name for React's reconciliation engine
    // React requires a Capitalized variable name when resolving dynamic components.
    const registryKey = blueprint.type as keyof typeof ComponentRegistry
    const ResolvedComponent = ComponentRegistry[registryKey]

    // 3. Establish the final type argument
    // If it's not found in the registry, it MUST be a lowercase native HTML tag (e.g., "div", "span").
    // If someone passed a bad custom string, we convert it to lowercase to prevent crashing, 
    // or fall back to a safe container.
    const FinalType = ResolvedComponent || blueprint.type.toLowerCase()

    const { children: _, ...cleanProps } = blueprint.props || {}

    // 4. Pass the capitalized variable reference or the sanitized lowercase string
    return React.createElement(FinalType as any, cleanProps, children)
}