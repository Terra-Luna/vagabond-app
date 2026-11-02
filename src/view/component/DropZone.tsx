import { HTMLAttributes, ReactNode, useState } from "react"

import { wealthBorderRounded } from "../common/border-styles"

type DropZoneProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "onDrop"> & {
    onDrop: (e: React.DragEvent<HTMLDivElement>) => unknown
    children: ReactNode | ((isHovered: boolean) => ReactNode)
    className?: string | ((isHovered: boolean) => string)
    unstyled?: boolean
    isHovered?: boolean
    onHoverChange?: (isHovered: boolean) => void
}

const boxClasses = "flex flex-col w-full items-center justify-center py-4 px-4 rounded text-text-header-primary/80 text-center whitespace-pre-line bg-sheet-header-fill"

/**
 * Reusable drag/drop target for consistent styling.
 */
export const DropZone = ({ onDrop, children, className, unstyled, isHovered: controlledHover, onHoverChange, ...rest }: DropZoneProps) => {
    const [localHover, setLocalHover] = useState(false)
    const isHovered = controlledHover ?? localHover

    const setHover = (hovered: boolean) => {
        setLocalHover(hovered)
        onHoverChange?.(hovered)
    }

    const extra = typeof className === "function" ? className(isHovered) : (className ?? "")
    const base = unstyled
        ? ""
        : `${boxClasses} ${isHovered ? wealthBorderRounded : "border border-dashed border-table-border"}`

    return (
        <div
            {...rest}
            className={`${base} ${extra}`.trim()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setHover(true) }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setHover(false) }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setHover(false); onDrop(e) }}
        >
            {typeof children === "function" ? children(isHovered) : children}
        </div>
    )
}
