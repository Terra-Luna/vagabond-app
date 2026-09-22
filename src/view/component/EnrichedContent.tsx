import React, { useEffect,useRef, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'

import { addCountdown, checkCountdownPermission } from '../../apps/vagabond-tools/usecase/VagabondSettingsHelper'

const countdownFormulaPattern = /^cd(\d+)$/i

export const EnrichedContent = ({ content, styleClasses = '', actor }: { content: any, styleClasses?: string, actor?: Actor | null }) => {
    const ref = useRef(null)
    const [enrichedText, setEnrichedText] = useState('')

    useEffect(() => {
        const enrich = async () => {
            const rc = await foundry.applications.ux.TextEditor.enrichHTML(content)
            setEnrichedText(rc)
        }
        enrich()
    }, [content])

    const onClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()

        /**
         * Inline Roll example: [[/r 2d6#Flavor Text]]{roll 2d6}
         */
        const inlineRoll = (e.target as HTMLElement).closest('a.inline-roll') as HTMLAnchorElement | null
        if (inlineRoll) {
            const { formula, roll, flavor } = inlineRoll.dataset
            const speaker = ChatMessage.getSpeaker(actor ? { actor } : undefined)

            const countdownMatch = formula?.match(countdownFormulaPattern)
            if (countdownMatch) {
                if (!checkCountdownPermission()) return
                const speakerName = speaker.alias ?? ''
                const label = flavor ? `${speakerName}: ${flavor}` : speakerName
                const actorId: string | undefined = actor?.id ?? undefined
                const tokenUuid: string | undefined = (actor?.isToken ? actor.token?.uuid : undefined) ?? undefined
                await addCountdown(label, Number(countdownMatch[1]), undefined, undefined, actorId, tokenUuid)
                return
            }

            try {
                let rollInstance

                if (roll) {
                    rollInstance = Roll.fromData(JSON.parse(decodeURIComponent(roll)))
                }
                else if (formula) {
                    let modifier = 0

                    if (formula?.includes('@') && actor) {
                        const path = formula.split('@').pop()
                        modifier = foundry.utils.getProperty(actor, `system.${path}`) as any
                    }

                    let f = formula.split('@')[0]

                    if (modifier > 0) {
                        f += `${modifier}`
                    }

                    if (f.endsWith('+') || f.endsWith('-')) {
                        f = f.slice(0, -1)
                    }

                    rollInstance = new Roll(f)
                }

                if (rollInstance) {
                    await rollInstance.evaluate()
                    await rollInstance.toMessage({
                        flavor: flavor || "Roll Result",
                        speaker: speaker
                    })
                }
            }
            catch (err) {
                console.error("Failed to parse or execute inline dice roll:", err)
            }
            return
        }

        const contentLink = (e.target as HTMLElement).closest('a.content-link') as HTMLAnchorElement | null
        if (!contentLink) return

        //E.g., @UUID[Compendium.vagabond-app.perks.Item.0KPyLXzTcPTQ3wFg]{Quick Draw Perk}
        foundry.applications.ux.TextEditor.getContentLink(contentLink.dataset as any).then((link) => {
            if (link) {
                const uuid = link.match(/\[([^\]]+)\]/)
                if (!uuid || uuid.length === 0) return

                fromUuid(uuid[1]).then((document) => {
                    if (document && 'sheet' in document && document.sheet) {
                        (document.sheet as any).render(true)
                    }
                    else {
                        console.warn(`Could not render sheet. Document with UUID "${uuid}" is invalid.`)
                    }
                })
            }
        })
    }

    const parserConfig = {
        transform: (node: any) => {
            if (node.type === 'tag' && node.attribs) {
                if (node.attribs.inert === "" || node.attribs.inert === "inert") {
                    node.attribs.inert = true
                } else if (node.attribs.inert === "false") {
                    delete node.attribs.inert
                }
            }
            return undefined
        }
    }

    return (
        <div
            ref={ref}
            className={`${styleClasses} ${linkStyles}`}
            onClick={onClick}
        >
            {ReactHtmlParser(enrichedText, parserConfig)}
        </div>
    )
}

/**
 * Probably move these to our css ??
 */
const inlineRollStyle = `
    /* Rolls style defaults */
    [&_.inline-roll]:text-text-header-tertiary
    [&_.inline-roll]:font-eskapade
    [&_.inline-roll]:font-bold
    [&_.inline-roll]:font-lg
    [&_.inline-roll]:shadow-sm
    hover:[&_.inline-roll]:cursor-pointer
    hover:[&_.inline-roll]:text-shadow-text-glow
    hover:[&_.inline-roll]:text-shadow-xl
    transition-colors
`
const docLinkSytles = `
    /* All enriched links */
    [&_a]:text-[1.05em]
    hover:[&_a]:cursor-pointer
    hover:[&_a]:underline

    /* Doc Link Defaults */
    [&_.content-link]:font-eskapade
    [&_.content-link]:font-bold
    [&_.content-link]:shadow-xs
    [&_.content-link_i]:text-text-header-tertiary
    hover:[&_.inline-roll]:cursor-pointer
    transition-colors

    /* Actors / NPCs */
    [&_a[data-type='Actor']]:text-text-header-tertiary
    hover:[&_a[data-type='Actor']]:underline

    /* Items / Equipment */
    [&_a[data-type='Item']]:text-text-header-tertiary
    hover:[&_a[data-type='Item']]:underline

    /* Journal Entries */
    [&_a[data-type='JournalEntry']]:text-text-header-tertiary
    hover:[&_a[data-type='JournalEntry']]:underline

    /* Roll Tables */
    [&_a[data-type='RollTable']]:text-orange-800
    hover:[&_a[data-type='RollTable']]:underline
`
const linkStyles = [inlineRollStyle, docLinkSytles].join(' ')