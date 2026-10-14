import { FunctionComponent } from "react"
import ReactDom from "react-dom/client"

import { FoundryHotkeyBlocker } from "../view/component/FoundryHotkeyBlocker"
import { DimensionsContext } from "../view/context/DimensionsContext"
import { EditModeContextProvider } from "../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../view/context/EditModeContext/EditModeOptions"
import { EmotionCacheContext } from "../view/context/EmotionCacheContext"
import { getTheme, sys_id } from "./foundryUtils"
import { createStyleTag } from "./styleUtils"

export interface VagabondApplication {
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

export const onRenderHTML = (sheet: VagabondApplication) => {
    if (sheet._reactRoot && !sheet.element.querySelector(':scope > .app-root')) {
        sheet._reactRoot.unmount()
        sheet._reactRoot = null
    }

    if (!sheet._reactRoot) {
        const defaultWindowContent = sheet.element.getElementsByClassName('window-content')?.[0] as HTMLElement | undefined
        if (defaultWindowContent) {
            defaultWindowContent.replaceChildren()
            defaultWindowContent.style.display = "none"
        }
        const appDiv = document.createElement('div')
        appDiv.setAttribute("class", "app-root")
        const reactRootElem = sheet.element.appendChild(appDiv)

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

export const onRender = (sheet: VagabondApplication) => {
    queueMicrotask(() => {
        if (!sheet.element) return
        sheet._toolbarHeight = sheet.element.children?.[0]?.getBoundingClientRect()?.height ?? 0
    })
}

/**
 * Centers the window horizontally on first render. Vertically centers then raises by the given vertAdj arg.
 */
export const centerOnFirstRender = (sheet: any, vertAdj = 500) => {
    if (sheet._centeredOnFirstRender) return
    sheet._centeredOnFirstRender = true

    requestAnimationFrame(() => {
        const bounds = sheet.element?.getBoundingClientRect()
        if (!bounds) return

        sheet.setPosition({
            left: Math.round((window.innerWidth - bounds.width) / 2),
            top: Math.max(0, Math.round((window.innerHeight - bounds.height) / 2) - vertAdj)
        })
    })
}

export const onUpdatePosition = (sheet: VagabondApplication, position: any) => {
    const minWidth = 360
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

export const onClose = (sheet: VagabondApplication) => {
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
export const onRenderWithWrappers = (sheet: VagabondApplication, theme = "light", position: any, startInEditMode: boolean | EditModeOptions = false) => {
    const { width, top, left } = position
    const rawHeight = position.height
    const toolbarOffset = sheet._toolbarHeight || 0
    const ownerWindow = sheet.element?.ownerDocument?.defaultView ?? window
    const isDetached = ownerWindow !== window
    let height: number

    /**
     * Sheets may be height "auto", in which case their height needs to be calculated based off the DOM height.
     */
    if (isDetached) {
        height = Math.max(ownerWindow.innerHeight - toolbarOffset, 100)
    }
    else if (typeof rawHeight === "number" && !isNaN(rawHeight)) {
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
                            ${theme} app-themed-content flex flex-col bg-sheet-main-fill
                            font-paradigm tracking-wider rounded-b-lg overflow-hidden
                        `}
                            style={{
                                height: (isDetached || typeof rawHeight === "number") ? height : "100%",
                                maxHeight: isDetached ? undefined : `calc(88vh - ${top}px)`,
                                overflowY: (rawHeight === "auto" && !isDetached) ? "auto" : undefined,
                            }}>
                            <sheet.Component {...sheet.getReactProps()} />
                        </div>
                    </EmotionCacheContext>
                </EditModeContextProvider>
            </DimensionsContext.Provider>
        </FoundryHotkeyBlocker>
    )
}

export const onDetach = (sheet: VagabondApplication, sourceDocument, targetDocument) => {
    // add our fonts to the detached document
    const fontFaces = [
        new FontFace(
            'Eskapade',
            `url("systems/${sys_id}/assets/fonts/eskapade-black.ttf")`,
            { weight: 'bold', style: 'normal', }
        ),
        new FontFace(
            'Eskapade',
            `url("systems/${sys_id}/assets/fonts/eskapade-regular.ttf")`,
            { weight: 'normal', style: 'normal', }
        ),
        new FontFace(
            'Paradigm',
            `url("systems/${sys_id}/assets/fonts/paradigm-regular.otf")`,
            { weight: 'normal', style: 'normal', }
        ),
        new FontFace(
            'Paradigm',
            `url("systems/${sys_id}/assets/fonts/paradigm-bold.otf")`,
            { weight: 'bold', style: 'normal', }
        ),
    ];

    Promise.all(fontFaces.map(face => face.load())).then(fonts => fonts.forEach(
        font => targetDocument?.fonts.add(font)
    ));

    (sheet as any).super?._onDetach(sourceDocument, targetDocument)

    if (targetDocument?.head && sheet.element?.id) {
        const fillStyle = targetDocument.createElement("style")
        fillStyle.textContent = `#${sheet.element.id} { top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; max-width: none !important; max-height: none !important; border-radius: 0 !important; }`
        targetDocument.head.appendChild(fillStyle)
    }
    sheet.renderWithWrappers({ theme: getTheme(), position: sheet.position })

    targetDocument?.defaultView?.addEventListener("resize", () => {
        sheet.renderWithWrappers({ theme: getTheme(), position: sheet.position })
    })

}