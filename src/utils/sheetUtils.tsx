import { FunctionComponent } from "react"
import ReactDom from "react-dom/client"

import { FoundryHotkeyBlocker } from "../view/component/FoundryHotkeyBlocker"
import { DimensionsContext } from "../view/context/DimensionsContext"
import { EditModeContextProvider } from "../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../view/context/EditModeContext/EditModeOptions"
import { EmotionCacheContext } from "../view/context/EmotionCacheContext"
import { getTheme } from "./foundryUtils"
import { createStyleTag } from "./styleUtils"

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

        const resizeHandle = sheet.element.querySelector('.window-resize-handle')
        if (resizeHandle) sheet.element.appendChild(resizeHandle)

        sheet.element.style.setProperty("overflow", "visible")
        sheet._scaduRoot = reactRootElem.attachShadow({ mode: 'open' })
        sheet._scaduRoot.appendChild(createStyleTag())
        sheet._reactRoot = ReactDom.createRoot(sheet._scaduRoot)

        const header = sheet.element.querySelector('.window-header')
        header?.addEventListener('dblclick', () => {
            sheet._isCollapsed = !sheet._isCollapsed
            sheet.render()
        })
    }

    sheet.renderWithWrappers({ theme: getTheme(), position: sheet.position })
}

export const onRender = (sheet: VGLiteApplication) => {
    queueMicrotask(() => {
        if (!sheet.element) return
        sheet._toolbarHeight = sheet.element.children?.[0]?.getBoundingClientRect()?.height ?? 0
    })
}

export const onUpdatePosition = (sheet: VGLiteApplication, position: any) => {
    const minWidth = 380
    const minHeight = 248
    const { width, top, left } = position
    /**
     * Bottom edge (top + height) must not go past 88vh, i.e. within 12vh of the screen bottom
     * or else Foundry messes with the re-size handle positioning by nudging it above the hotbar.
     */
    const maxHeight = Math.min(1440, Math.max(minHeight, (window.innerHeight * 0.88) - top))
    const realWidth = width === "auto" ? width : Math.max(minWidth, width)

    let height = position.height
    const initHeight = height === "auto" ? sheet.element.getBoundingClientRect().height : height
    const calculatedHeight = Math.min(Math.max(minHeight, initHeight), maxHeight)

    if (!(height === "auto" && calculatedHeight < maxHeight && calculatedHeight >= minHeight)) {
        height = calculatedHeight
    }

    const nextPosition = { width: realWidth, height, top, left }
    const previousPosition = (sheet as any)._lastNormalizedPosition
    const shouldRerender = !previousPosition || previousPosition.width !== nextPosition.width || previousPosition.height !== nextPosition.height;
    (sheet as any)._lastNormalizedPosition = nextPosition

    if (!sheet._reactRoot || !shouldRerender) return { ...position, width: realWidth, height }

    const pendingFrame = (sheet as any)._positionRenderFrame as number | undefined
    if (pendingFrame) cancelAnimationFrame(pendingFrame);
    (sheet as any)._positionRenderFrame = requestAnimationFrame(() => {
        (sheet as any)._positionRenderFrame = undefined
        sheet.renderWithWrappers({ theme: getTheme(), position: nextPosition })
    })

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
     * Sheets may be height "auto", in which case their height needs to be calculated based off the DOM height.
     */
    if (typeof rawHeight === "number" && !isNaN(rawHeight)) {
        height = rawHeight - toolbarOffset
    }
    else {
        const totalDomHeight = sheet.element?.offsetHeight || 600
        height = Math.max(Math.min(totalDomHeight, window.innerHeight) - toolbarOffset, 100)
    }

    sheet?.element?.style?.setProperty("overflow", sheet._isCollapsed ? "hidden" : "visible")

    sheet._reactRoot?.render(
        <FoundryHotkeyBlocker>
            <DimensionsContext.Provider value={{ width, height, top, left }}>
                <EditModeContextProvider initialEditMode={(typeof startInEditMode === "boolean") ? (startInEditMode ? EditModeOptions.TRUE : EditModeOptions.FALSE) : startInEditMode}>
                    <EmotionCacheContext scaduRoot={sheet._scaduRoot}>
                        <div className={`
                            ${theme} vglite-themed-content flex flex-col bg-sheet-main-fill
                            font-paradigm tracking-wider rounded-b-lg overflow-hidden
                        `}
                            style={{
                                height: typeof rawHeight === "number" ? height : "100%",
                                maxHeight: `calc(88vh - ${top}px)`,
                                overflowY: rawHeight === "auto" ? "auto" : undefined,
                            }}>
                            <sheet.Component {...sheet.getReactProps()} />
                        </div>
                    </EmotionCacheContext>
                </EditModeContextProvider>
            </DimensionsContext.Provider>
        </FoundryHotkeyBlocker>
    )
}