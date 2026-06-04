import { Collapsible, CollapsibleHeaderProps } from "./Collapsible";
import { Divider } from "./Header"

const cardLayout = "ml-2 mr-2 mt-1 mb-1"

const cardHeaderLayout = "flex items-center pt-2 pb-1 pl-2 pr-2 bg-section-header-fill"
const cardHeaderTextStyle = "text-text-section-header text-xl font-eskapade font-bold rounded-t-lg"

const cardSubheaderLayout = "flex items-center border-r-1 border-solid border-table-border"
const cardSubheaderTextStyle = "flex text-text-section-header text-sm pb-1 pl-2 pr-8 bg-section-header-fill [clip-path:polygon(0_0,100%_0,85%_100%,0_100%)]"

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
                        <CardBody description={description} />
                    </>
                )}
            />
        </div >
    )
}

const CardHeader = ({ title, toggleCollapsedButton, toggleCollapsed }: CollapsibleHeaderProps) => {
    return (
        <div onClick={toggleCollapsed} className={cardHeaderLayout+" "+cardHeaderTextStyle+" cursor-pointer"}>
            <div className="w-full">{title}</div>
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
            <div className={cardSubheaderTextStyle}>{formatSubHeader(content)}</div>
        </div>
    )
}

const formatSubHeader = (content: CardSubHeaderValues): string => {
    let subHeader = ''
    content.forEach(c => {
        let sub = `${c[0]}: ${c[1]}`
        if (content.indexOf(c) < content.length - 1) {
            sub += "  |  "
        }
        subHeader += sub
    })
    return subHeader
}

/**
 * Special example: [
 *      { key: "Crit", value: "Some on-crit effect." }
 * ]
 */
const CardBody = ({ description }: { description: string }) => {
    return (
        <div className={cardBodyLayout}>
            <div>
                <span className={cardBodyTextStyle}>{description}</span>
            </div>
        </div>
    )
}