import { getTokenImg } from "../../utils/modelUtil"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DiceRollComponent } from "./component/DiceRollComponent"

export interface InlineRollTermData {
    faces?: number
    results?: { result: number, discarded?: boolean, exploded?: boolean, rerolled?: boolean }[]
    expression?: string
}

export interface InlineRollData {
    formula: string
    total: number
    terms: InlineRollTermData[]
}

const InlineRoll = ({ roll }: { roll: InlineRollData }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex flex-wrap items-center justify-center gap-1">
                {roll.terms.map((term, i) => {
                    if (Array.isArray(term.results) && term.faces) {
                        return term.results.map((r, j) => (
                            <DiceRollComponent
                                key={`${i}-${j}`}
                                faces={term.faces!}
                                result={r.result}
                                textSize="text-4xl"
                                discarded={r.discarded === true}
                                exploded={!!r.exploded}
                                rerolled={!!r.rerolled}
                            />
                        ))
                    }
                    return <span key={i} className="text-2xl">{term.expression}</span>
                })}
                <span className="text-2xl">= {roll.total}</span>
            </div>
            <span className="text-base text-text-tertiary font-normal italic">{roll.formula}</span>
        </div>
    )
}

const getVisibilityLabel = (whisper: string[], blind: boolean): string | undefined => {
    if (whisper.length === 0) return
    if (blind) return "Visible: GM only"

    const gmIds = (game.users?.filter(u => u.isGM) ?? []).map(u => u.id)
    if (whisper.length === gmIds.length && whisper.every(id => gmIds.includes(id))) return "Visible: GM only"

    const names = whisper.map(id => game.users?.get(id)?.name).filter(Boolean)
    return `Visible: ${names.join(", ")}`
}

export const InlineRollChatCard = ({ actorId, userId, alias, flavor, whisper = [], blind = false, rolls = [], textHtml }: {
    actorId?: string
    userId?: string
    alias: string
    flavor?: string
    whisper?: string[]
    blind?: boolean
    rolls?: InlineRollData[]
    textHtml?: string
}) => {
    const actor = actorId ? game.actors?.get(actorId) : undefined
    const token = actor?.getActiveTokens?.()[0]
    const portrait = (actor ? getTokenImg(actor) : game.users?.get(userId ?? "")?.avatar) ?? ""

    const title = (
        <span className="flex flex-col leading-tight">
            <span>{alias}</span>
            <span className="text-xs font-normal opacity-80">{getVisibilityLabel(whisper, blind)}</span>
            {rolls.length > 0 && flavor && <span className="text-sm font-normal">{flavor}</span>}
        </span>
    )

    return (
        <BaseChatCardHost
            banner={<ChatCardBanner tokenId={token?.id ?? actor?.id} portrait={portrait} title={title} />}
            contents={rolls.length > 0
                ? rolls.map((roll, i) => <InlineRoll key={i} roll={roll} />)
                : <div className="text-base text-text-primary font-normal" dangerouslySetInnerHTML={{ __html: textHtml ?? "" }} />}
        />
    )
}
