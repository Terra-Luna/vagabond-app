const { api, sheets } = foundry.applications
import ReactDom from "react-dom/client"
import ItemDataModel, { BaseItemSchema } from "../../../model/item/ItemDataModel"
import { DimensionsContext } from "../../context/DimensionsContext";

export const updateActor = async <T extends ItemDataModel<any>>(item: { system: T, update: any }, update: Partial<Record<keyof T, any>>) => {
    const updates = {}
    Object.entries(update).forEach(([key, value]) => {
        updates[`system.${key}`] = value;
    })
    await item.update(updates);
}

export interface FoundryItem<T extends ItemDataModel<BaseItemSchema>> {
    update: (data: Record<keyof T, any>) => any
    system: T
}

// @ts-expect-error
export abstract class VgLiteItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
    _reactRoot: ReactDom.Root | null = null

    static DEFAULT_OPTIONS = {
        window: {
            resizable: false
        }
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
        const minWidth = 280
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

    abstract Component: React.ComponentType<any>

    getReactProps() {
        return {
            item: this.item
        }
    }

}

export const ItemSheetHeader = ({ item }: { item: ItemDataModel<BaseItemSchema> }) => {
    return <div className="vglite-item-sheet-header">
        {item.parent.name}
        {item.description}
    </div>
}