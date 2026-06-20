// @ts-ignore
import vgliteStyles from "../../../public/styles/vagabond-lite.css?inline"
import ReactDom from "react-dom/client"
import { DimensionsContext } from "../context/DimensionsContext"

export const VgLiteSheetMixin = (superclass) => class extends superclass {
    _reactRoot: ReactDom.Root | null = null
    _toolbarHeight: number = 0

    static DEFAULT_OPTIONS = {
        position: {
            width: 440,
            height: 1200
        },
        window: {
            resizable: false
        }
    }

    // Prep our react root and shadow dom if needed, and render
    async _renderHTML() {
        if (!this._reactRoot) {
            const defaultWindowContent = this.element.getElementsByClassName('window-content')?.[0]
            defaultWindowContent && this.element.removeChild(defaultWindowContent)

            const vgLiteDiv = document.createElement('div')
            vgLiteDiv.setAttribute("class", "vglite-root")
            const reactRootElem = this.element.appendChild(vgLiteDiv)

            this.element.style.setProperty("overflow", "visible")
 
            const scaduRoot = reactRootElem.attachShadow({ mode: 'open' })
            this._reactRoot = ReactDom.createRoot(scaduRoot)
        }

        this.renderWithWrappers({ theme: this._getTheme(), position: this.position })
    }

    _replaceHTML() { } // no-op, implemented just to comply with sheets api

    async _onRender(context, options) {
        super._onRender(context, options)
        this._toolbarHeight = this.element.children[0].getBoundingClientRect().height
    }

    _getTheme() {
        return (game.settings as any).get("core", "uiConfig").colorScheme.applications
    }

    _updatePosition(position) {
        const minWidth = 420
        const minHeight = 500
        const { width, height, top, left } = position
        const realWidth = width === "auto" ? width : Math.max(minWidth, width)
        const realHeight = height === "auto" ? height : Math.max(minHeight, height)

        this.renderWithWrappers({ theme: this._getTheme(), position: { width: realWidth, height: realHeight, top, left } })
        return super._updatePosition({ ...position, width: realWidth, height: realHeight })
    }

    protected _onClose(options) {
        super._onClose(options)
        this._reactRoot?.unmount()
        this._reactRoot = null
    }

    renderWithWrappers({ theme = "light", position }: { theme: string, position: { width: number, height: number, top: number, left: number } }) {
        let { width, height, top, left } = position
        height -= this._toolbarHeight!

        this._reactRoot!.render(
            <DimensionsContext.Provider value={{ width, height, top, left }}>
                <style>{vgliteStyles}</style>
                <div className={`${theme} vglite-themed-content bg-sheet-main-fill font-paradigm tracking-wider flex flex-col rounded-b-lg`} style={{ height }}>
                    <this.Component {...this.getReactProps()} />
                </div>
            </DimensionsContext.Provider>
        );
    }

    protected getReactProps() {
        return { sheet: this }
    }
}

export const glowOnHover = "hover:[text-shadow:0_0_10px_var(--color-text-glow)]"