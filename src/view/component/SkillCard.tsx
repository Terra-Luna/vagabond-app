import { ReactNode } from 'react'

import { CardHeader } from './CardHeader'
import { Collapsible } from "./Collapsible"
import { EnrichedContent } from './EnrichedContent'

const cardSubheaderLayout = "flex -mt-0.5"
const cardSubheaderStyle = "flex gap-x-2 py-1 pl-2 pr-1 items-center bg-section-header-fill"
const cardSubheaderLabel = "text-sm text-text-header-secondary font-eskapade font-bold"
const cardSubheaderValue = "text-base text-text-header-primary font-eskapade font-normal"
const cardBodyLayout = "p-2 border-b-1 border-l-1 border-r-1 border-solid border-table-border"
const cardBodyStyle = "text-text-primary text-sm antialiased text-justify"

export const SkillCard = ({ img = '', dmgType = 'none', title, subtitles, description, startCollapsed = true }: {
    img?: string, dmgType?: string, title: string, subtitles: CardSubHeaderValues[], description: string, startCollapsed?: boolean
}) => {
    return (
        <Collapsible
            startCollapsed={startCollapsed}
            img={img}
            dmgType={dmgType}
            title={title}
            Header={CardHeader}
            content={(<>
                <CardSubHeader values={subtitles} />
                <CardBody description={description} />
            </>)}
        />
    )
}

export const HeaderWithClipPath = ({ children, showRightBorder, fullWidth }: {
    children: ReactNode, showRightBorder?: boolean, fullWidth?: boolean
}) => {
    const fullWidthClass = fullWidth ? "w-full" : ""
    const borderClass = showRightBorder ? "border-r-1 border-solid border-table-border" : ""
    return (
        <div className={`${cardSubheaderLayout} ${borderClass}`}>
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
                values.map((content, index) => (
                    <div key={content.label + index} className="flex gap-x-1">
                        <div className={cardSubheaderLabel}>{content.label}:</div>
                        <div className={cardSubheaderValue}>{content.value}</div>
                    </div>
                ))
            }
        </HeaderWithClipPath>
    )
}

const CardBody = ({ description }: { description: string }) => {
    return (
        <div className={cardBodyLayout}>
            <div className={cardBodyStyle}>
                <EnrichedContent content={description} />
            </div>
        </div>
    )
}