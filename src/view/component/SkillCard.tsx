import ReactHtmlParser from 'react-html-parser'
import { Collapsible } from "./Collapsible"
import { CardHeader } from './CardHeader'
import { ReactNode } from 'react'

const cardSubheaderLayout = "flex -mt-0.5"
const cardSubheaderStyle = "flex gap-x-2 py-1 pl-2 pr-8 items-center bg-section-header-fill [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]"
const cardSubheaderLabel = "text-sm text-text-header-secondary font-eskapade font-bold"
const cardSubheaderValue = "text-base text-text-header-primary font-eskapade font-normal"
const cardBodyLayout = "p-2 border-b-1 border-l-1 border-r-1 border-solid border-table-border"
const cardBodyStyle = "text-text-primary text-sm antialiased"

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
            content={(
                <>
                    <CardSubHeader values={subtitles} />
                    <CardBody description={description} />
                </>
            )}
        />
    )
}

export const HeaderWithClipPath = ({ children, showRightBorder }: { children: ReactNode, showRightBorder?: boolean }) => {
    return (
        <div className={`${cardSubheaderLayout} ${showRightBorder ? 'border-r-1 border-solid border-table-border' : ''}`}>
            <div className={cardSubheaderStyle}>{children}</div>
        </div>
    )
}

/**
 * Content map example: [
 *      {key: "Type", value: "Humanlike" },
        *      {key: "Size", value: "Medium" }
        *    ]
        */
export type CardSubHeaderValues = { label: string, value: string }
export const CardSubHeader = ({ values, showRightBorder = true }: { values: CardSubHeaderValues[], showRightBorder?: boolean }) => {
    return (
        <HeaderWithClipPath showRightBorder={showRightBorder}>
            {
                values.map((content, index) => (
                    <div key={content.label + index} className="flex gap-x-1">
                        <p className={cardSubheaderLabel}>{content.label}:</p>
                        <p className={cardSubheaderValue}>{content.value}</p>
                    </div>
                ))
            }
        </HeaderWithClipPath>
    )
}

/**
 * Special example: [
 *      {key: "Crit", value: "Some on-crit effect." }
        * ]
        */
const CardBody = ({ description }: { description: string }) => {
    return (
        <div className={cardBodyLayout}>
            <div className={cardBodyStyle}>{ReactHtmlParser(description)}</div>
        </div>
    )
}