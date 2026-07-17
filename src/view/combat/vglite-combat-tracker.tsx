/**
 * The combat tracker works a bit differently from our other react UI - it's not a "sheet" really,
 *   it's a "part" of a broader CombatTracker framework that foundry has running.
 * We've rendered our placeholder-template that just has a div for us to find, and we'll do normal
 *   react-root shadow-dom stuff from there
 */

import ReactDom from "react-dom/client"
import { vgLiteStyles } from "../../utils/styleUtils"
import { getTheme } from "../../utils/foundryUtils"
import { EditModeContextProvider } from "../context/EditModeContext/EditModeContext"
import { EmotionCacheContext } from "../context/EmotionCacheContext"
import { CombatTracker } from "./CombatTracker"

export const renderCombatTracker = (html, data) => {
    const rootDiv = $(html).find("#vglite-root")[0]

    const scaduRoot = rootDiv.attachShadow({ mode: 'open' })
    const reactRoot = ReactDom.createRoot(scaduRoot)
    
    const theme = getTheme()

    reactRoot.render(
        <EditModeContextProvider>
            <EmotionCacheContext scaduRoot={scaduRoot}>
                <style>{vgLiteStyles} </style>
                <div className={`${theme} vglite-themed-content bg-sheet-main-fill font-paradigm tracking-wider flex flex-col rounded-b-lg`}>
                    <CombatTracker data={data} />
                </div>
            </EmotionCacheContext>
        </EditModeContextProvider>
    );
}
