import ReactDom from "react-dom/client"
import { FunctionComponent, ReactNode, useCallback, useRef } from "react"
import * as sheetUtils from "./sheets/sheetUtils"

/** 
 * This pattern has many gotchas! 
 * You are basically creating an "orphaned" popup that is its own scope.
 * It has its own edit mode context, etc.
*/
class PopoutApplication extends foundry.applications.api.ApplicationV2 {
    Component?: FunctionComponent
    startInEditMode: boolean = false
    onClose?: () => void;

    _reactRoot: ReactDom.Root | null = null
    _scaduRoot: any
    _toolbarHeight: number = 0
    _isCollapsed: boolean = false

    // Prep our react root and shadow dom if needed, and render
    async _renderHTML() {
        sheetUtils.onRenderHTML(this as any)
    }

    _replaceHTML() { } // no-op, implemented just to comply with application api

    async _onRender(context, options) {
        super._onRender(context, options)
        sheetUtils.onRender(this as any)
    }

    _updatePosition(position) {
        return super._updatePosition(sheetUtils.onUpdatePosition(this as any, position))
    }

    protected _onClose(options) {
        super._onClose(options)
        this.onClose?.()
        sheetUtils.onClose(this as any)
    }

    renderWithWrappers({ theme = "light", position }: { theme: string, position: { width: number, height: number, top: number, left: number } }) {
        sheetUtils.onRenderWithWrappers(this as any, theme, position, this.startInEditMode)
    }

    protected getReactProps() {
        return { sheet: this }
    }

    static DEFAULT_OPTIONS = {
        position: { width: 600, height: 1000 },
        window: {
            resizable: true
        },
        // Block Foundry hotkeys...
        forms: [{ handler: () => { }, submitOnChange: false }]
    }
}


export const useGlobalPopout = (onClose?: () => void) => {
    const applicationRef = useRef(new PopoutApplication())

    const renderPopout = useCallback((content: ReactNode, title: string, editMode = false) => {
        const app = applicationRef.current
        app.Component = () => content
        app.startInEditMode = editMode
        app.options.window.title = title
        app.onClose = onClose;
        app.render(true)
    }, [])

    return { renderPopout }
}