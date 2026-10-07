import ReactDom from "react-dom/client"

import { onClose, onRender, onRenderHTML, onRenderWithWrappers, onUpdatePosition } from "../../utils/sheetUtils"

export const VagabondSheetMixin = (superclass) => class extends superclass {
    _reactRoot: ReactDom.Root | null = null
    _scaduRoot: any
    _toolbarHeight: number = 0
    _isCollapsed: boolean = false

    static DEFAULT_OPTIONS = {
        position: {
            width: 440,
            height: "auto",
            top: 100,
            left: 100
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
        // Events are retargeted to the shadow host, so the real target comes from the composed path.
        const isEditableTarget = (e: Event) => {
            const target = e.composedPath()[0] as HTMLElement | undefined
            return !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        }
        htmlElement.addEventListener("keydown", (e) => {
            if (e.key === "F5" || (e.ctrlKey && e.key === "r")) return
            // Let form controls receive their own key events (e.g., arrow/tab/enter in dropdowns); they're stopped on the way back up below.
            if (isEditableTarget(e)) return
            e.stopPropagation()
            e.stopImmediatePropagation()
        }, { capture: true })
        htmlElement.addEventListener("keydown", (e) => {
            if (e.key === "F5" || (e.ctrlKey && e.key === "r")) return
            e.stopPropagation()
        })
    }

    _toggleDisabled(disabled: boolean) {
        try {
            if (!this.element) return
            super._toggleDisabled(disabled)
        }
        catch (error) {
            console.warn("Vagabond | Form permission check exception:", error)
        }
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

    async _animateClose() {
        return
    }

    renderWithWrappers({ theme = "light", position }: { theme: string, position: { width: number, height: number, top: number, left: number } }) {
        onRenderWithWrappers(this as any, theme, position)
    }

    protected getReactProps() {
        return { sheet: this }
    }
}