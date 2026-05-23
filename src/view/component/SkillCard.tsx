import { Divider } from "./Header"

export const SkillCard = ({ title, subtitle, description, special }: {
    title: string, subtitle: Map<string, string>, description: string, special: Map<string, string>
}) => {
    return (
        <div className="vglite-card">
            <SkillCardHeader title={title} />
            <CardSubHeader content={subtitle} />
            <SkillCardBody description={description} special={special}/>
        </div>
    )
}

const SkillCardHeader = ({ title }: { title: string }) => {
    return (
        <div className="vglite-card-header">
            <div>{title}</div>
            <Divider />
        </div>
    )
}

/**
 * Content map example: [
 *      { key: "Type", value: "Humanlike" },
 *      { key: "Size", value: "Medium" }
 *    ]
 */
const CardSubHeader = ({ content }: { content: Map<String, string> }) => {
    return (
        <div className="vglite-card-sub-header">
            {content.entries().map(([cardKey, cardValue]) => {

            })}
            <div>{content.entries().next().value?.[0]}: {content.entries().next().value?.[1]}</div>
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