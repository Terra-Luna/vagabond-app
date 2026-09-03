/**
 * The combat tracker works a bit differently from our other react UI - it's not a "sheet" really,
 *   it's a "part" of a broader CombatTracker framework that foundry has running.
 * We've rendered our placeholder-template that just has a div for us to find, and we'll do normal
 *   react-root shadow-dom stuff from there.
 */
import ReactDom from "react-dom/client"

import { getTheme } from "../../utils/foundryUtils"
import { createStyleTag } from "../../utils/styleUtils"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EmotionCacheContext } from "../../view/context/EmotionCacheContext"
import { CombatTracker } from "./CombatTracker"
import { CombatContext } from "./hooks"

export class VagabondCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
    htmlRoot?: HTMLElement
    scaduRoot?: ShadowRoot
    reactRoot?: ReactDom.Root

    /**
     * This is the only function we need to override. The CombatTracker renders 3 different parts - the header, tracker (main content, what we care about), and footer
     * What usually happens is that every time this is called, result.tracker will be the result of calling our handlebars template on the combat data
     * Since that's always the same, we can intercept all renders after the first and just return the same div with a refreshed react tree
     */
    protected _replaceHTML(result: { tracker: HTMLElement }, content, options): void {
        if (options.isFirstRender && result.tracker) {
            this.htmlRoot = result.tracker
            this.scaduRoot = this.htmlRoot.attachShadow({ mode: 'open' })
            this.reactRoot = ReactDom.createRoot(this.scaduRoot!)
            this.scaduRoot.appendChild(createStyleTag())
        } else {
            result.tracker = this.htmlRoot!
        }

        const combat = game.combat

        const activeCombatantId = combat?.current?.combatantId

        const theme = getTheme()

        this.reactRoot?.render(
            <EditModeContextProvider>
                <CombatContext.Provider value={{ activeCombatantId: activeCombatantId, activeGroup: null, combatTracker: this }}>
                    <EmotionCacheContext scaduRoot={this.scaduRoot}>
                        <div className={`${theme} vglite-themed-content bg-sheet-main-fill font-paradigm tracking-wider flex flex-col h-full`}>
                            <CombatTracker combat={combat} />
                        </div>
                    </EmotionCacheContext>
                </CombatContext.Provider>
            </EditModeContextProvider>
        );

        super._replaceHTML(result, content, options)
    }
}

interface CombatTracker {
    hoverCombatant: (combatant: any, hovered: boolean) => void;
}
