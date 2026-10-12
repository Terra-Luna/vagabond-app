import type { ComponentType } from "react"

let tooltipComponent: ComponentType<{ item: any, hideBottomSection?: boolean }> | null = null

export const setItemTooltipComponent = (component: ComponentType<{ item: any, hideBottomSection?: boolean }>) => {
    tooltipComponent = component
}

export const getItemTooltipComponent = () => tooltipComponent
