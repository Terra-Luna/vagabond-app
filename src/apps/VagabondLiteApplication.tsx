import { FC } from "react"
import { Root } from "react-dom/client"
import { EditModeOptions } from "../view/context/EditModeContext/EditModeOptions"
import * as sheetUtils from "../utils/sheetUtils"

export interface VagabondLiteAppArgs {
    window?: Partial<{ title: string, minimizable: boolean, resizable: boolean }>,
    position?: Partial<{ width: number | "auto", height: number | "auto" }>, 
    editModeOptions?: EditModeOptions,
    Component: React.FC<any>
}

export abstract class VagabondLiteApplication extends foundry.applications.api.ApplicationV2 {
    Component: FC
    editModeOptions: EditModeOptions

    private _reactRoot: Root | null = null
    private static _openAppsRegistry = new Map<any, VagabondLiteApplication>()

    static override DEFAULT_OPTIONS: Partial<typeof foundry.applications.api.ApplicationV2["DEFAULT_OPTIONS"]> = {
        window: { title: "", minimizable: true, resizable: true },
        position: {
            width: 550,
            height: "auto",
            top: 120,
            left: 120
        }
    }

    constructor(args: VagabondLiteAppArgs) {
        super(
            structuredClone({
                window: {
                    ...VagabondLiteApplication.DEFAULT_OPTIONS.window, ...args.window
                },
                position: {
                    ...VagabondLiteApplication.DEFAULT_OPTIONS.position, ...args.position
                }
            }),
        )
        this.Component = args.Component
        this.editModeOptions = args.editModeOptions ?? EditModeOptions.NEVER

        /**
         * Check that the user doesn't already have the app open by comparing it
         * to the custom _openAppsRegistry.
         */
        const Constructor = this.constructor
        const existing = VagabondLiteApplication._openAppsRegistry.get(Constructor)
        const isExistingClosing = (existing?.state as any) === "CLOSING" || (existing as any)?._state === 4

        if (existing && !isExistingClosing) {
            existing.bringToFront();
            (this as any)._state = 5
        }
        else {
            VagabondLiteApplication._openAppsRegistry.set(Constructor, this)
        }
    }

    /**
     * Prevent Foundry from opening the same app more than once per user.
     * @param options
     * @returns 
     */
    protected override _canRender(options: any): false | void {
        if (super._canRender(options) === false) return false

        const Constructor = this.constructor
        const currentActive = VagabondLiteApplication._openAppsRegistry.get(Constructor)
        if (currentActive && currentActive.id !== this.id) {
            currentActive.bringToFront()
            return false
        }
        return
    }

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

    renderWithWrappers({ theme = "light", position }: { theme: string, position: { width: number, height: number, top: number, left: number } }) {
        sheetUtils.onRenderWithWrappers(this as any, theme, position, this.editModeOptions)
    }

    protected getReactProps() {
        return { sheet: this }
    }

    protected override _onClose(options): void {
        const Constructor = this.constructor
        if (VagabondLiteApplication._openAppsRegistry.get(Constructor) === this) {
            VagabondLiteApplication._openAppsRegistry.delete(Constructor)
        }

        if (this._reactRoot) {
            this._reactRoot.unmount()
            this._reactRoot = null
        }

        super._onClose(options)
    }
    
}