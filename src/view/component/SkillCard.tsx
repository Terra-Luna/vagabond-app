import ReactHtmlParser from 'react-html-parser'
import { Collapsible } from "./Collapsible"
import { CardHeader } from './CardHeader'

const cardSubheaderLayout = "flex items-center border-r-1 border-solid border-table-border"
const cardSubheaderStyle = "flex text-text-section-header text-sm pb-1 pl-2 pr-8 bg-section-header-fill [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]"

const cardBodyLayout = "rounded-b-lg p-2 border-b-1 border-l-1 border-r-1 border-solid border-table-border rounded-b-lg"
const cardBodyStyle = "text-text-primary text-sm antialiased"

export const SkillCard = ({ title, subtitles, description }: {
    title: string, subtitles: CardSubHeaderValues, description: string
}) => {
    return (
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
    )
}

/**
 * Content map example: [
 *      { key: "Type", value: "Humanlike" },
 *      { key: "Size", value: "Medium" }
 *    ]
 */
type CardSubHeaderValues = [subKey: string, subValue: string][]
export const CardSubHeader = ({ content }: { content: CardSubHeaderValues }) => {
    return (
        <div className={cardSubheaderLayout}>
            <div className={cardSubheaderStyle}>{formatSubHeader(content)}</div>
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
            <div className={cardBodyStyle}>{ReactHtmlParser(description)}</div>
        </div>
    )
}