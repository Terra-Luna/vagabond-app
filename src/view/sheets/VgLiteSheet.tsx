import ReactDom from "react-dom/client"
import { DimensionsContext } from "../context/DimensionsContext"
import vgliteStyles from "../../../public/styles/vagabond-lite.css?inline"

export const VgLiteSheetMixin = (superclass) => class extends superclass {
    _reactRoot: ReactDom.Root | null = null

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

            const scaduRoot = reactRootElem.attachShadow({ mode: 'open' })
            this._reactRoot = ReactDom.createRoot(scaduRoot)
        }

        this.renderWithWrappers({ theme: this._getTheme() })
    }

    _replaceHTML() { } // no-op, implemented just to comply with sheets api

    async _onRender(context, options) {
        super._onRender(context, options)
    }

    _getTheme() {
        return (game.settings as any).get("core", "uiConfig").colorScheme.applications
    }

    _updatePosition(position) {
        const minWidth = 420
        const minHeight = 500
        const { width, height } = position
        const realWidth = width === "auto" ? width : Math.max(minWidth, width)
        const realHeight = height === "auto" ? height : Math.max(minHeight, height)

        this.renderWithWrappers({ width: realWidth, height: realHeight, theme: this._getTheme() })

        return super._updatePosition({ ...position, width: realWidth, height: realHeight })
    }

    protected _onClose(options) {
        super._onClose(options)
        this._reactRoot = null
    }

    renderWithWrappers({ width = 1, height = 1, theme = "light" }: { width?: number, height?: number, theme: string }) {
        this._reactRoot!.render(
            <DimensionsContext.Provider value={{ width, height }}>
                <style>{vgliteStyles}</style>
                <div className={`${theme} vglite-themed-content font-paradigm tracking-wider bg-body-fill`}>
                    <this.Component {...this.getReactProps()} width={width} height={height} />
                </div>
            </DimensionsContext.Provider>
        );
    }

    protected getReactProps() {
        return { sheet: this }
    }
}