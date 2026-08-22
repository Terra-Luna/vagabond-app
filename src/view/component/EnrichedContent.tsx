import React, { useEffect,useRef, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'

export const EnrichedContent = ({ content, styleClasses = '' }) => {
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

        const inlineRoll = (e.target as HTMLElement).closest('a.inline-roll') as HTMLAnchorElement | null
        if (inlineRoll) {
            const { formula, roll, flavor } = inlineRoll.dataset

            try {
                let rollInstance

                if (roll) {
                    rollInstance = Roll.fromData(JSON.parse(decodeURIComponent(roll)))
                } else if (formula) {
                    rollInstance = new Roll(formula)
                }

                if (rollInstance) {
                    await rollInstance.evaluate()
                    await rollInstance.toMessage({
                        flavor: flavor || "Roll Result",
                        speaker: ChatMessage.getSpeaker()
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

        foundry.applications.ux.TextEditor.getContentLink(contentLink.dataset as any).then((uuid) => {
            if (uuid) {
                fromUuid(uuid).then((document) => {
                    if (document && 'sheet' in document && document.sheet) {
                        (document.sheet as any).render(true)
                    } else {
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
 * Probably move these to vagabond-lite.css ??
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

    /* Rolls flaved as #damage */
    [&_a[data-flavor='damage']]:text-text-dmg

    /* Rolls flaved as #healing */
    [&_a[data-flavor='healing']]:text-text-luck-current
`
const docLinkSytles = `
    /* Doc Link Defaults */
    [&_.content-link]:font-eskapade
    [&_.content-link]:font-bold
    [&_.content-link]:shadow-xs
    [&_.content-link_i]:text-current
    hover:[&_.inline-roll]:cursor-pointer
    transition-colors

    /* Actors / NPCs (Blue Theme) */
    [&_a[data-type='Actor']]:bg-blue-950/40
    [&_a[data-type='Actor']]:text-blue-400
    [&_a[data-type='Actor']]:border-blue-500/30
    hover:[&_a[data-type='Actor']]:bg-blue-900/50

    /* Items / Equipment (Amber Theme) */
    [&_a[data-type='Item']]:bg-amber-950/40
    [&_a[data-type='Item']]:text-amber-400
    [&_a[data-type='Item']]:border-table-border/30
    hover:[&_a[data-type='Item']]:bg-amber-900/50

    /* Journal Entries (Slate Theme) */
    [&_a[data-type='JournalEntry']]:bg-slate-800
    [&_a[data-type='JournalEntry']]:text-slate-300
    [&_a[data-type='JournalEntry']]:border-table-border
    hover:[&_a[data-type='JournalEntry']]:bg-slate-700

    /* Roll Tables (Purple Theme) */
    [&_a[data-type='RollTable']]:bg-purple-950/40
    [&_a[data-type='RollTable']]:text-purple-400
    [&_a[data-type='RollTable']]:border-purple-500/30
    hover:[&_a[data-type='RollTable']]:bg-purple-900/50
`
const linkStyles = [inlineRollStyle, docLinkSytles].join(' ')