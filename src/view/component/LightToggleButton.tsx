import { LightSourceUtil } from "../../utils/LightSourceUtil"
import { IconOnlyButton } from "./IconOnlyButton"
import { Tooltip } from "./Tooltip"

export const LightToggleButton = ({ item, className, size = 16, isHeld = true }: { item: any, className?: string, size?: number, isHeld?: boolean }) => {
    const option = LightSourceUtil.contextMenuOption(item, isHeld)
    if (!option) return null

    return (
        <Tooltip content={option.label}>
            <IconOnlyButton
                Icon={option.icon as any}
                className={className}
                size={size}
                onClick={(e) => option.action?.(e as any)}
            />
        </Tooltip>
    )
}
