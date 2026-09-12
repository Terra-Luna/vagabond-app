import { ReactNode } from 'react'

import { CardHeader } from './CardHeader'
import { Collapsible } from "./Collapsible"
import { EnrichedContent } from './EnrichedContent'
import { SkillCardAction } from './Header'

const cardSubheaderLayout = "flex -mt-0.5"
const cardSubheaderStyle = "flex gap-x-2 py-1 pl-2 pr-1 items-center bg-section-header-fill"
const cardSubheaderLabel = "text-sm text-text-header-secondary font-eskapade font-bold"
const cardSubheaderValue = "text-base text-text-header-primary font-eskapade font-normal"
const cardBodyLayout = "p-2 border-b-1 border-l-1 border-r-1 border-solid border-table-border"
const cardBodyStyle = "text-text-primary text-sm antialiased text-justify font-paradigm font-normal"

export const SkillCard = ({ actor, img = '', dmgType = 'none', title, subtitles, description, startCollapsed = true, actions = [] }: {
    actor?: Actor,
    img?: string,
    dmgType?: string,
    title: string,
    subtitles: CardSubHeaderValues[],
    description: string,
    startCollapsed?: boolean,
    actions?: SkillCardAction[]
}) => {
    return (
        <Collapsible
            img={img}
            title={title}
            dmgType={dmgType}
            startCollapsed={startCollapsed}
            actions={actions}
            Header={CardHeader}
            content={(<>
                <CardSubHeader values={subtitles} />
                <CardBody actor={actor} description={description} />
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

const CardBody = ({ actor, description }: { actor?: Actor, description: string }) => {
    return (
        <div className={cardBodyLayout}>
            <div className={cardBodyStyle}>
                <EnrichedContent actor={actor} content={description} />
            </div>
        </div>
    )
}