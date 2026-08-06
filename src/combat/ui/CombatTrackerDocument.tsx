/**
 * The combat tracker works a bit differently from our other react UI - it's not a "sheet" really,
 *   it's a "part" of a broader CombatTracker framework that foundry has running.
 * We've rendered our placeholder-template that just has a div for us to find, and we'll do normal
 *   react-root shadow-dom stuff from there.
 */

import ReactDom from "react-dom/client"
import { vgLiteStyles } from "../../utils/styleUtils"
import { getTheme } from "../../utils/foundryUtils"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EmotionCacheContext } from "../../view/context/EmotionCacheContext"
import { CombatTracker } from "./CombatTracker"
import { createContext, useContext } from "react"
import { CombatGroup } from "../../model/combat/VgLiteCombatant"

export class VgLiteCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
    htmlRoot?: HTMLElement
    scaduRoot?: ShadowRoot
    reactRoot?: ReactDom.Root

    /**
     * This is the only function we need to override. The CombatTracker renders 3 different parts - the header, tracker (main content, what we care about), and footer
     * What usually happens is that every time this is called, result.tracker will be the result of calling our handlebars template on the combat data
     * Since that's always the same, we can intercept all renders after the first, and just return our existing react root, so that it updates appropriately (and doesn't flash)
     */
    protected _replaceHTML(result: { tracker: HTMLElement }, content, options): void {
        if (options.isFirstRender && result.tracker) {
            this.htmlRoot = result.tracker
            this.scaduRoot = this.htmlRoot.attachShadow({ mode: 'open' })
            this.reactRoot = ReactDom.createRoot(this.scaduRoot!)
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
                        <style>{vgLiteStyles}</style>
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

interface CombatContextProps {
    activeCombatantId?: string | null;
    activeGroup?: CombatGroup | null;
    combatTracker?: CombatTracker;
}
const CombatContext = createContext<CombatContextProps>({ activeCombatantId: null, activeGroup: null, combatTracker: {} as CombatTracker })

export const useIsCurrentCombatant = (combatant) => {
    const { activeCombatantId } = useContext(CombatContext)
    return activeCombatantId === combatant.id || activeCombatantId === combatant._id
}

export const useCombatContext = () => useContext(CombatContext)
