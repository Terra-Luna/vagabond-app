import ReactDom from "react-dom/client"
import { vgLiteStyles } from "../utils/styleUtils";
import { EditModeContextProvider } from "./context/EditModeContext/EditModeContext";
import { EmotionCacheContext } from "./context/EmotionCacheContext";
import { getTheme } from "../utils/foundryUtils";
import { ReactNode, useCallback } from "react";
import { EditModeOptions } from "./context/EditModeContext/EditModeOptions";

/** 
 * This pattern has many gotchas! 
 * You are basically creating an "orphaned" popup that is now owned by the window.
 * It has its own edit mode context
*/
const createContainerRoot = () => {
    const containerDiv = document.createElement('div')
    containerDiv.setAttribute('style', "position: absolute;")
    const reactRootElem = document.body.appendChild(containerDiv)

    //reactRootElem.setProperty("overflow", "visible") we may want this uncommented eventually

    const scaduRoot = reactRootElem.attachShadow({ mode: 'open' })
    const reactRoot = ReactDom.createRoot(scaduRoot)

    return { reactRoot, scaduRoot }
}

export const useGlobalPopout = () => {
    const { reactRoot, scaduRoot } = createContainerRoot()
    const theme = getTheme()

    const renderPopout = useCallback((content: ReactNode, editMode: EditModeOptions = EditModeOptions.NEVER) => {
        reactRoot.render(
            <EditModeContextProvider initialEditMode={editMode}>
                <EmotionCacheContext scaduRoot={scaduRoot}>
                    <style>{vgLiteStyles}</style>
                    <div className={`${theme}`}>
                        {content}
                    </div>
                </EmotionCacheContext>
            </EditModeContextProvider>)
    }, [reactRoot, scaduRoot, theme])

    const closePopout = useCallback(() => {
        reactRoot.unmount()
    }, [reactRoot])

    return { renderPopout, closePopout }
}