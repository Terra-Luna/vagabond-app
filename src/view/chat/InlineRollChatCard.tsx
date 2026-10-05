import { createRoot, Root } from "react-dom/client"

import { sys_id } from "../../utils/foundryUtils"
import { getTokenImg } from "../../utils/modelUtil"
import { createStyleTag } from "../../utils/styleUtils"
import { SmartScrollWrapper } from "./ChatCardRehydrator"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"
import { DiceRollComponent } from "./component/DiceRollComponent"

const rawRollRoots = new Map<string, Set<Root>>()

const D66_FORMULA = /^1?d6\*10\+1?d6$/i

// eslint-disable-next-line react-refresh/only-export-components
const InlineRollCard = ({ roll }: { roll: any }) => {
    const isD66 = D66_FORMULA.test(String(roll.formula).replace(/\s+/g, "")) && roll.dice?.length === 2
    const terms = isD66 ? roll.dice : roll.terms

    return (
        <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex flex-wrap items-center justify-center gap-1">
                {terms.map((term: any, i: number) => {
                    if (Array.isArray(term.results) && term.faces) {
                        return term.results.map((r: any, j: number) => (
                            <DiceRollComponent
                                key={`${i}-${j}`}
                                faces={term.faces}
                                result={r.result}
                                textSize="text-4xl"
                                discarded={r.discarded === true}
                                exploded={!!r.exploded}
                                rerolled={!!r.rerolled}
                            />
                        ))
                    }
                    return <span key={i} className="text-2xl">{term.expression ?? term.formula}</span>
                })}
                <span className="text-2xl">= {roll.total}</span>
            </div>
            <span className="text-base text-text-tertiary font-normal italic">{roll.formula}</span>
        </div>
    )
}

const getVisibilityLabel = (message: any): string | undefined => {
    const whisper: string[] = Array.from(message.whisper ?? [])
    if (whisper.length === 0) return

    const users = whisper.map(id => game.users?.get(id)).filter(u => !!u) as any[]
    const gmIds = (game.users?.filter(u => u.isGM) ?? []).map(u => u.id)
    const isGmOnly = whisper.length === gmIds.length && whisper.every(id => gmIds.includes(id))
    if (message.blind) return "Blind roll: visible to GM only"
    if (isGmOnly) return "Visible: GM only"

    return `Visible: ${users.map(u => u.name).join(", ")}`
}

export const renderInlineRoll = (message: any, html: HTMLElement) => {
    if (message.getFlag?.(sys_id, "blueprint")) return
    if (html.querySelector(".vagabond-react-chat-root")) return

    const hasRolls = !!message.rolls?.length
    const isUserText = [1, 2, 3].includes(message.style ?? message.type)
    if (!hasRolls && !isUserText) return

    const content = html.querySelector(".message-content") as HTMLElement | null
    if (!content) return
    const textHtml = content.innerHTML

    const id = message.id ?? ""

    html.style.background = "transparent"
    html.style.border = "none"
    html.style.boxShadow = "none"
    html.style.padding = "0"
    const coreHeader = html.querySelector(".message-header") as HTMLElement | null
    if (coreHeader) coreHeader.style.display = "none"

    content.replaceChildren()
    const shadow = content.attachShadow({ mode: "open" })
    shadow.appendChild(createStyleTag())

    const container = document.createElement("div")
    shadow.appendChild(container)

    const root = createRoot(container)
    const roots = rawRollRoots.get(id) ?? new Set<Root>()
    roots.add(root)
    rawRollRoots.set(id, roots)

    const appThemeClass = (game.settings as any).get("core", "uiConfig")?.colorScheme?.applications ?? "theme-dark"

    const actor = message.speakerActor ?? message.author?.character
    const token = actor?.getActiveTokens?.()[0]
    const portrait = (actor ? getTokenImg(actor) : message.author?.avatar) ?? ""
    const title = (
        <span className="flex flex-col leading-tight">
            <span>{message.alias || message.author?.name || ""}</span>
            <span className="text-xs font-normal opacity-80">{getVisibilityLabel(message)}</span>
            {hasRolls && message.flavor && <span className="text-sm font-normal">{message.flavor}</span>}
        </span>
    )

    root.render(
        <div className={appThemeClass}>
            <SmartScrollWrapper>
                <BaseChatCardHost
                    banner={<ChatCardBanner tokenId={token?.id ?? actor?.id} portrait={portrait} title={title} />}
                    contents={hasRolls
                        ? message.rolls.map((roll: any, i: number) => <InlineRollCard key={i} roll={roll} />)
                        : <div className="text-base text-text-primary font-normal" dangerouslySetInnerHTML={{ __html: textHtml }} />}
                />
            </SmartScrollWrapper>
        </div>
    )
}

export const unmountRawRollMessage = (id: string) => {
    rawRollRoots.get(id)?.forEach(r => { try { r.unmount() } catch { /* no-op */ } })
    rawRollRoots.delete(id)
}