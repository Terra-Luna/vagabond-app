import { Collapsible, CollapsibleHeaderProps } from "./Collapsible";
import { Divider } from "./Header"

const cardLayout = "ml-2 mr-2 mt-1 mb-1"
const cardHeaderLayout = "flex items-center justify-between gap-2 pt-2 pb-1 pl-2 pr-2 bg-section-header-fill"
const cardHeaderTextStyle = "rounded-t-lg text-text-section-header text-xl font-eskapade font-bold"
const cardSubheaderLayout = "flex items-center justify-between gap-1 border-l-1 border-r-1 border-solid border-table-border"
const cardSubheaderTextStyle = "text-text-section-header text-sm pb-1 pl-2 pr-2 w-fit bg-section-header-fill"
const cardBodyLayout = "bg-body-fill rounded-b-lg p-2 border-b-1 border-l-1 border-r-1 border-solid border-table-border rounded-b-lg"
const cardBodyTextStyle = "text-text-primary text-sm leading-none antialiased"

export const SkillCard = ({ title, subtitles, description }: {
    title: string, subtitles: CardSubHeaderValues, description: string
}) => {
    return (
        <div className={cardLayout}>
            <Collapsible
                startCollapsed
                title={title}
                Header={CardHeader}
                content={(
                    <>
                        <CardSubHeader content={subtitles} />
                        <SkillCardBody description={description} />
                    </>
                )}
            />
        </div >
    )
}

const CardHeader = ({ title, toggleCollapsedButton, toggleCollapsed }: CollapsibleHeaderProps) => {
    return (
        <div onClick={toggleCollapsed} className={cardHeaderLayout+" "+cardHeaderTextStyle}>
            <div>{title}</div>
            <Divider />
            {toggleCollapsedButton}
        </div>
    )
}

/**
 * Content map example: [
 *      { key: "Type", value: "Humanlike" },
 *      { key: "Size", value: "Medium" }
 *    ]
 */
type CardSubHeaderValues = [subKey: string, subValue: string][]
const CardSubHeader = ({ content }: { content: CardSubHeaderValues }) => {
    return (
        <div className={cardSubheaderLayout}>
            <div className={cardSubheaderTextStyle}>
                {content.map(([cardKey, cardValue]) => (
                    <div>{cardKey}: {cardValue}</div>)
                )}
            </div>
        </div>
    )
}

/**
 * Special example: [
 *      { key: "Crit", value: "Some on-crit effect." }
 * ]
 */
const SkillCardBody = ({ description }: { description: string }) => {
    return (
        <div className={cardBodyLayout}>
            <div>
                <span className={cardBodyTextStyle}>{description}</span>
            </div>
        </div>
    )
}