const { api, sheets } = foundry.applications;
import ReactDom from "react-dom/client"
import ActorDataModel, { BaseActorSchema } from "../../../model/actor/ActorDataModel";
import { DimensionsContext } from "../../context/DimensionsContext";

export const updateActor = async <T extends ActorDataModel<any>>(actor: { system: T, update: any }, update: Partial<Record<keyof T, any>>) => {
    const updates = {}
    Object.entries(update).forEach(([key, value]) => {
        updates[`system.${key}`] = value;
    })
    await actor.update(updates);
}

export interface FoundryActor<T extends ActorDataModel<BaseActorSchema>> {
    update: (data: Record<keyof T, any>) => any
    system: T
}

// @ts-expect-error
export abstract class VgLiteActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
    _reactRoot: ReactDom.Root | null = null

    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: 800
        },
        window: {
            resizable: false
        }
    }

    async _onRender(context, options) {
        super._onRender(context, options)
        if (!this._reactRoot) {
            const defaultWindowContent = this.element.getElementsByClassName('window-content')?.[0]
            defaultWindowContent && this.element.removeChild(defaultWindowContent)

            const vgLiteDiv = document.createElement('div')
            vgLiteDiv.setAttribute("class", "vglite-root")
            const reactRootElem = this.element.appendChild(vgLiteDiv)
            this._reactRoot = ReactDom.createRoot(reactRootElem)
        }

        this.renderWithWrappers({ theme: this._getTheme() })
    }

    _getTheme() {
        console.log((game.settings as any).get("core", "uiConfig").colorScheme.applications)
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
                <div className={`theme-${theme} vglite-themed-content`}>
                    <this.Component {...this.getReactProps()} width={width} height={height} />
                </div>
            </DimensionsContext.Provider>
        );
    }

    getReactProps() { return { actor: this.actor } }

    abstract Component: React.ComponentType<any>;
}