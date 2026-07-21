/**
 * The combat tracker works a bit differently from our other react UI - it's not a "sheet" really,
 *   it's a "part" of a broader CombatTracker framework that foundry has running.
 * We've rendered our placeholder-template that just has a div for us to find, and we'll do normal
 *   react-root shadow-dom stuff from there.
 */

import ReactDom from "react-dom/client"
import { vgLiteStyles } from "../../utils/styleUtils"
import { getTheme } from "../../utils/foundryUtils"
import { EditModeContextProvider } from "../context/EditModeContext/EditModeContext"
import { EmotionCacheContext } from "../context/EmotionCacheContext"
import { CombatTracker } from "./CombatTracker"
import { createContext, useContext } from "react"

export const renderCombatTracker = (app, html, data) => {
    const rootDiv = $(html).find("#vglite-root")[0]

    const scaduRoot = rootDiv.attachShadow({ mode: 'open' })
    const reactRoot = ReactDom.createRoot(scaduRoot)

    const theme = getTheme()

    const { combat } = data

    const activeCombatantId = combat?.current?.combatantId

    reactRoot.render(
        <EditModeContextProvider>
            <CombatContext.Provider value={{ activeCombatantId, activeGroup: null, combatTracker: app }}>
                <EmotionCacheContext scaduRoot={scaduRoot}>
                    <style>{vgLiteStyles} </style>
                    <div className={`${theme} vglite-themed-content bg-sheet-main-fill font-paradigm tracking-wider flex flex-col rounded-b-lg`}>
                        <CombatTracker data={data} />
                    </div>
                </EmotionCacheContext>
            </CombatContext.Provider>
        </EditModeContextProvider>
    );
}

interface CombatTracker {
    hoverCombatant: (combatant: any, hovered: boolean) => void;
}

const CombatContext = createContext({ activeCombatantId: null, activeGroup: null, combatTracker: {} as CombatTracker })

export const useIsCurrentCombatant = (combatant) => {
    const { activeCombatantId } = useContext(CombatContext)
    return activeCombatantId === combatant.id || activeCombatantId === combatant._id
}

export const useCombatContext = () => useContext(CombatContext)
