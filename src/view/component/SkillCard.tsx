import { Collapsible, CollapsibleHeaderProps } from "./Collapsible";
import { Divider } from "./Header"

type CardSubHeaderValues = [subKey: string, subValue: string][];

export const SkillCard = ({ title, subtitles, description, special }: {
    title: string, subtitles: CardSubHeaderValues, description: string, special: Map<string, string>
}) => {
    return (
        <div className="vglite-card">
            <Collapsible
                startCollapsed
                title={title}
                Header={SkillCardHeader}
                content={(
                    <>
                        <CardSubHeader content={subtitles} />
                        <SkillCardBody description={description} special={special} />
                    </>
                )}
            />
        </div >
    )
}

const SkillCardHeader = ({ title, toggleCollapsedButton, toggleCollapsed }: CollapsibleHeaderProps) => {
    return (
        <div onClick={toggleCollapsed} className="vglite-card-header">
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
const CardSubHeader = ({ content }: { content: CardSubHeaderValues }) => {
    return (
        <div className="vglite-card-sub-header">
            {content.map(([cardKey, cardValue]) => (
                <div>{cardKey}: {cardValue}</div>)
            )}
        </div>
    )
}

/**
 * Special example: [
 *      { key: "Crit", value: "Some on-crit effect." }
 * ]
 */
const SkillCardBody = ({ description, special }: {
    description: string, special: Map<string, string>
}) => {
    return (
        <div className="vglite-card-body">
            <div>
                <span className="vglite-body-text">{description}</span>
                <span className="vglite-body-text-highlight"><br></br>{special.entries().next().value?.[0]}: </span>
                <span className="vglite-body-text">{special.entries().next().value?.[1]}</span>
            </div>
        </div>
    )
}