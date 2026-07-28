import ReactDom from "react-dom/client"
import { getTheme } from "../../utils/foundryUtils";
import { vgLiteStyles } from "../../utils/styleUtils";
import { DimensionsContext } from "../context/DimensionsContext";
import { EditModeContextProvider } from "../context/EditModeContext/EditModeContext";
import { EmotionCacheContext } from "../context/EmotionCacheContext";
import { FunctionComponent } from "react";
import { EditModeOptions } from "../context/EditModeContext/EditModeOptions";
import { FoundryHotkeyBlocker } from "../component/FoundryHotkeyBlocker";

export interface VGLiteApplication {
    _reactRoot: ReactDom.Root | null;
    _scaduRoot: ShadowRoot;
    _isCollapsed: boolean;
    _toolbarHeight: number;

    element: HTMLElement;
    position: any;
    render: () => void;
    renderWithWrappers: ({ theme, position }) => any;

    Component: FunctionComponent;
    getReactProps: () => any;
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
        header!.addEventListener('dblclick', () => {
            sheet._isCollapsed = !sheet._isCollapsed
            sheet.render()
        })
    }

    sheet.renderWithWrappers({ theme: getTheme(), position: sheet.position })
}

export const onRender = (sheet: VGLiteApplication) => {
    sheet._toolbarHeight = sheet.element.children[0].getBoundingClientRect().height
}

export const onUpdatePosition = (sheet: VGLiteApplication, position: any) => {
    const minWidth = 400
    const minHeight = 248
    const { width, height, top, left } = position
    const realWidth = width === "auto" ? width : Math.max(minWidth, width)
    const realHeight = height === "auto" ? height : Math.max(minHeight, height)

    sheet.renderWithWrappers({ theme: getTheme(), position: { width: realWidth, height: realHeight, top, left } })
    return { ...position, width: realWidth, height: realHeight }
}

export const onClose = (sheet: VGLiteApplication) => {
    sheet._reactRoot?.unmount()
    sheet._reactRoot = null
}

export const onRenderWithWrappers = (sheet: VGLiteApplication, theme = "light", position: any, startInEditMode = false) => {
    const { width, top, left } = position
    let { height } = position
    height -= sheet._toolbarHeight!

    sheet.element.style.setProperty("overflow", sheet._isCollapsed ? "hidden" : "visible")

    sheet._reactRoot!.render(
        <FoundryHotkeyBlocker>
            <DimensionsContext.Provider value={{ width, height, top, left }}>
                <EditModeContextProvider initialEditMode={startInEditMode ? EditModeOptions.TRUE : EditModeOptions.FALSE}>
                    <EmotionCacheContext scaduRoot={sheet._scaduRoot}>
                        <style>{vgLiteStyles} </style>
                        <div className={`${theme} vglite-themed-content bg-sheet-main-fill font-paradigm tracking-wider flex flex-col rounded-b-lg`} style={{ height }}>
                            <sheet.Component {...sheet.getReactProps()} />
                        </div>
                    </EmotionCacheContext>
                </EditModeContextProvider>
            </DimensionsContext.Provider>
        </FoundryHotkeyBlocker>
    );
}