const { api, sheets } = foundry.applications;
import ReactDom from "react-dom/client"
import ActorDataModel, { BaseActorSchema } from "../../model/actor/ActorDataModel";
import { DimensionsContext } from "../context/DimensionsContext";

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
export abstract class VagabondLiteActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
    _reactRoot: ReactDom.Root | null = null

    static DEFAULT_OPTIONS = {
        position: {
            width: 'auto',
            height: 'auto',
        },
        window: {
            title: 'Ayyyyyy',
            resizable: true
        },
    }

    async _onRender(context, options) {
        super._onRender(context, options)
        if (!this._reactRoot) {
            const defaultWindowContent = this.element.getElementsByClassName('window-content')?.[0]
            defaultWindowContent && this.element.removeChild(defaultWindowContent)

            const reactRootElem = this.element.appendChild(document.createElement('div'))
            this._reactRoot = ReactDom.createRoot(reactRootElem)
        }
        this._reactRoot!.render(<this.Component {...this.getReactProps()} />)
    }

    _updatePosition(position) {
        const minWidth = 360
        const { width, height } = position
        const realWidth = width === "auto" ? width : Math.max(minWidth, width)
        this._reactRoot!.render(<DimensionsContext.Provider value={{ width: realWidth, height }}>
            <this.Component {...this.getReactProps()} width={width} height={height} />
        </DimensionsContext.Provider>
        )

        return super._updatePosition({ ...position, width: realWidth })
    }

    protected _onClose(options) {
        super._onClose(options)
        this._reactRoot = null
    }

    getReactProps() { return { actor: this.actor } }

    abstract Component: React.ComponentType<any>;
}