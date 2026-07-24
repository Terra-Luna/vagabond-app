import ReactDom from "react-dom/client"
import { FunctionComponent, ReactNode, useCallback, useRef } from "react"
import * as sheetUtils from "../view/sheets/sheetUtils"

export const CLOSE_GLOBAL_POPOUT_HOOK = "closeGlobalPopout" as any

export const useGlobalPopout = (onClose?: () => void) => {
    const applicationRef = useRef(new PopoutApplication())
    const popoutId = useRef(crypto.randomUUID())

    const renderPopout = useCallback((content: ReactNode, title: string, editMode = false) => {
        const app = applicationRef.current
        app.Component = () => content
        app.startInEditMode = editMode
        app.options.window.title = title
        app.onClose = onClose;
        app.render({ force: true } as any)
        app.onCloseHookId = Hooks.on(CLOSE_GLOBAL_POPOUT_HOOK, (id) => {
            if (popoutId.current === id) {
                app.close()
            }
        })
    }, [])

    return { renderPopout, popoutId: popoutId.current }
}

/** 
 * This pattern has many gotchas! 
 * You are basically creating an "orphaned" popup that is its own scope.
 * It has its own edit mode context, etc.
*/
class PopoutApplication extends foundry.applications.api.ApplicationV2 {
    Component?: FunctionComponent
    startInEditMode: boolean = false
    onClose?: () => void;
    onCloseHookId?: number

    _reactRoot: ReactDom.Root | null = null
    _scaduRoot: any
    _toolbarHeight: number = 0
    _isCollapsed: boolean = false

    // Prep our react root and shadow dom if needed, and render
    async _renderHTML() {
        sheetUtils.onRenderHTML(this as any)
    }

    _replaceHTML(result: HTMLElement, content: HTMLElement, options: any) {
        content.replaceChildren(result)
    }

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

    close(options?: { animate?: boolean | undefined; closeKey?: boolean | undefined; submitted?: boolean | undefined }): Promise<this> {
        if (this.onCloseHookId) {
            Hooks.off(CLOSE_GLOBAL_POPOUT_HOOK, this.onCloseHookId)
            delete this.onCloseHookId
        }
        return super.close(options)
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