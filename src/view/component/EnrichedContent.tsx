import { useEffect, useRef, useState } from "react"

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

    const onClick = async (e) => {
        e.preventDefault()

        const inlineRoll = e.target.closest('a.inline-roll')
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
        }

        const contentLink = e.target.closest('a.content-link')
        if (!contentLink) return
        foundry.applications.ux.TextEditor.getContentLink(e).then((uuid) => {
            if (uuid) {
                fromUuid(uuid).then((document) => (document as any)?.sheet.render(true))
            }
        })
    }

    return (
        <div
            ref={ref}
            className={`${styleClasses} ${linkStyles}`}
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: enrichedText }}
        />
    )
}

/**
 * Probably move these to vagabond-lite.css ??
 */
const inlineRollStyle = `
    /* Rolls style defaults */
    [&_.inline-roll]:text-stat-block-fill
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
    [&_a[data-type='Item']]:border-amber-500/30
    hover:[&_a[data-type='Item']]:bg-amber-900/50

    /* Journal Entries (Slate Theme) */
    [&_a[data-type='JournalEntry']]:bg-slate-800
    [&_a[data-type='JournalEntry']]:text-slate-300
    [&_a[data-type='JournalEntry']]:border-slate-700
    hover:[&_a[data-type='JournalEntry']]:bg-slate-700

    /* Roll Tables (Purple Theme) */
    [&_a[data-type='RollTable']]:bg-purple-950/40
    [&_a[data-type='RollTable']]:text-purple-400
    [&_a[data-type='RollTable']]:border-purple-500/30
    hover:[&_a[data-type='RollTable']]:bg-purple-900/50
`
const linkStyles = [inlineRollStyle, docLinkSytles].join(' ')