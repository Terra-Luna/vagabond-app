import ReactDom from "react-dom/client"
import { getTheme } from "./foundryUtils"
import { vgLiteStyles } from "./styleUtils"
import { DimensionsContext } from "../view/context/DimensionsContext"
import { EditModeContextProvider } from "../view/context/EditModeContext/EditModeContext"
import { EmotionCacheContext } from "../view/context/EmotionCacheContext"
import { FunctionComponent } from "react"
import { EditModeOptions } from "../view/context/EditModeContext/EditModeOptions"
import { FoundryHotkeyBlocker } from "../view/component/FoundryHotkeyBlocker"

export interface VGLiteApplication {
    _reactRoot: ReactDom.Root | null
    _scaduRoot: ShadowRoot
    _isCollapsed: boolean
    _toolbarHeight: number
    element: HTMLElement
    position: any
    
    render: () => void
    renderWithWrappers: ({ theme, position }) => any
    
    Component: FunctionComponent
    getReactProps: () => any
}

export const onRenderHTML = (sheet: VGLiteApplication) => {
    if (!sheet._reactRoot) {
        const defaultWindowContent = sheet.element.getElementsByClassName('window-content')?.[0]
        if (defaultWindowContent) sheet.element.removeChild(defaultWindowContent)

        const vgLiteDiv = document.createElement('div')
        vgLiteDiv.setAttribute("class", "vglite-root")
        const reactRootElem = sheet.element.appendChild(vgLiteDiv)

        sheet.element.style.setProperty("overflow", "visible")
        sheet._scaduRoot = reactRootElem.attachShadow({ mode: 'open' })
        sheet._reactRoot = ReactDom.createRoot(sheet._scaduRoot)

        const header = sheet.element.querySelector('.window-header');
        header?.addEventListener('dblclick', () => {
            sheet._isCollapsed = !sheet._isCollapsed
            sheet.render()
        })
    }

    sheet.renderWithWrappers({ theme: getTheme(), position: sheet.position })
}

export const onRender = (sheet: VGLiteApplication) => {
    sheet._toolbarHeight = sheet.element.children[0]?.getBoundingClientRect()?.height ?? 0
}

export const onUpdatePosition = (sheet: VGLiteApplication, position: any) => {
    const minWidth = 400
    const minHeight = 248
    const maxHeight = 1000
    const { width, top, left } = position
    const realWidth = width === "auto" ? width : Math.max(minWidth, width)

    let height = position.height
    const initHeight = height === "auto" ? sheet.element.getBoundingClientRect().height : height
    const calculatedHeight = Math.min(Math.max(minHeight, initHeight), maxHeight)

    if (!(height === "auto" && calculatedHeight < maxHeight && calculatedHeight >= minHeight)) {
        height = calculatedHeight
    }

    sheet.renderWithWrappers({ theme: getTheme(), position: { width: realWidth, height, top, left } })
    return { ...position, width: realWidth, height }
}

export const onClose = (sheet: VGLiteApplication) => {
    sheet._reactRoot?.unmount()
    sheet._reactRoot = null
}

/**
 * Renders the sheet or app 
 * @param sheet 
 * @param theme 
 * @param position 
 * @param startInEditMode 
 */
export const onRenderWithWrappers = (sheet: VGLiteApplication, theme = "light", position: any, startInEditMode: boolean | EditModeOptions = false) => {
    const { width, top, left } = position
    const rawHeight = position.height
    const toolbarOffset = sheet._toolbarHeight || 0
    let height: number

    /**
     * Sheets may be height "auto", in which case their height needs to be
     * calculated based off the DOM height. This is probably glitchy.
     */
    if (typeof rawHeight === "number" && !isNaN(rawHeight)) {
        height = rawHeight - toolbarOffset
    }
    else {
        const totalDomHeight = sheet.element?.offsetHeight || 600
        height = Math.max(totalDomHeight - toolbarOffset, 100)
    }

    sheet?.element?.style?.setProperty("overflow", sheet._isCollapsed ? "hidden" : "visible")

    sheet._reactRoot?.render(
        <FoundryHotkeyBlocker>
            <DimensionsContext.Provider value={{ width, height, top, left }}>
                <EditModeContextProvider initialEditMode={(typeof startInEditMode === "boolean") ? (startInEditMode ? EditModeOptions.TRUE : EditModeOptions.FALSE) : startInEditMode}>
                    <EmotionCacheContext scaduRoot={sheet._scaduRoot}>
                        <style>{vgLiteStyles}</style>
                        <div className={`
                            ${theme} vglite-themed-content flex flex-col bg-sheet-main-fill
                            font-paradigm tracking-wider rounded-b-lg overflow-hidden
                        `}
                            style={{ height: typeof rawHeight === "number" ? height : "100%" }}>
                            <sheet.Component {...sheet.getReactProps()} />
                        </div>
                    </EmotionCacheContext>
                </EditModeContextProvider>
            </DimensionsContext.Provider>
        </FoundryHotkeyBlocker>
    )
}