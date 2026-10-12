import { ReactNode } from 'react'

export const cardSubheaderLayout = "flex -mt-0.5"
export const cardSubheaderStyle = "flex gap-x-2 py-1 pl-2 pr-1 items-center bg-section-header-fill"
export const cardSubheaderLabel = "text-sm text-text-header-secondary font-eskapade font-bold"
export const cardSubheaderValue = "text-base text-text-header-primary font-eskapade font-normal"

export const HeaderWithClipPath = ({ children, showRightBorder, fullWidth }: {
    children: ReactNode, showRightBorder?: boolean, fullWidth?: boolean
}) => {
    const fullWidthClass = fullWidth ? "w-full" : ""
    const borderClass = showRightBorder ? "border-r-1 border-solid border-table-border" : ""
    return (
        <div className={`${cardSubheaderLayout} ${borderClass} bg-sheet-main-fill`}>
            <div className={`flex ${fullWidthClass}`}>
                <div className={`${cardSubheaderStyle} ${fullWidthClass}`}>{children}</div>
                <div className={`bg-sheet-header-fill w-6 -ml-[1px] [clip-path:polygon(0_0,0%_100%,10%_100%,100%_0)]`} />
            </div>
        </div>
    )
}

/**
 * Content map example: [
 *    {label: "Type", value: "Humanlike" },
 *    {label: "Size", value: "Medium" }
 *  ]
 */
export type CardSubHeaderValues = { label: string, value: string | ReactNode }

export const CardSubHeader = ({ values, showRightBorder = true }: { values: CardSubHeaderValues[], showRightBorder?: boolean }) => {
    return (
        <HeaderWithClipPath showRightBorder={showRightBorder}>
            {
                values.map((content, index) => {
                    const hasBlank = content.label.length === 0 || (content.value?.toString()?.length ?? 0) === 0
                    const gap = hasBlank ? "" : "gap-x-1"
                    return (
                        <div key={content.label + index} className={`flex ${gap} items-center`}>
                            <div className={cardSubheaderLabel}>{`${content.label}${hasBlank ? '' : ':'}`}</div>
                            <div className={cardSubheaderValue}>{content.value}</div>
                        </div>
                    )
                })
            }
        </HeaderWithClipPath>
    )
}
