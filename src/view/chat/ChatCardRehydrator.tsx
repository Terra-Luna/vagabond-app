import { createElement } from "react"
import { ComponentRegistry } from "../../ComponentRegistry"

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
    return createElement(FinalType as any, cleanProps, children)
}