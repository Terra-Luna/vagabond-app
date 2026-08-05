import ReactDom from "react-dom/client"
import { onClose, onRender, onRenderHTML, onRenderWithWrappers, onUpdatePosition } from "../../utils/sheetUtils"

export const VgLiteSheetMixin = (superclass) => class extends superclass {
    _reactRoot: ReactDom.Root | null = null
    _scaduRoot: any
    _toolbarHeight: number = 0
    _isCollapsed: boolean = false

    static DEFAULT_OPTIONS = {
        position: {
            width: 440,
            height: "auto",
            top: 0,
            left: 0
        },
        window: {
            resizable: false
        },
        dragDrop: [
            {
                dragSelector: ".draggable",
                dropSelector: ".sheet-body"
            }
        ]
    }

    // Prep our react root and shadow dom if needed, and render
    async _renderHTML() {
        onRenderHTML(this as any)
    }

    _replaceHTML() { } // no-op, implemented just to comply with sheets api

    _onFirstRender(context, options) {
        super._onFirstRender(context, options)

        const htmlElement = this.element
        if (!htmlElement) return

        // Prevent Foundry from capturing user keypresses on our sheets!!
        htmlElement.addEventListener("keydown", (e) => {
            if (e.key === "F5" || (e.ctrlKey && e.key === "r")) return
            e.stopPropagation()
            e.stopImmediatePropagation()
        }, { capture: true })
    }

    async _onRender(context, options) {
        super._onRender(context, options)
        onRender(this as any)
    }

    _updatePosition(position) {
        return super._updatePosition(onUpdatePosition(this as any, position))
    }

    protected _onClose(options) {
        super._onClose(options)
        onClose(this as any)
    }

    renderWithWrappers({ theme = "light", position }: { theme: string, position: { width: number, height: number, top: number, left: number } }) {
        onRenderWithWrappers(this as any, theme, position)
    }

    protected getReactProps() {
        return { sheet: this }
    }
}