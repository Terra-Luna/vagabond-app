import { FC } from "react"
import { Root } from "react-dom/client"

import * as sheetUtils from "../utils/sheetUtils"
import { EditModeOptions } from "../view/context/EditModeContext/EditModeOptions"

export interface VagabondAppArgs {
    window?: Partial<{ title: string, minimizable: boolean, resizable: boolean }>,
    position?: Partial<{ width: number | "auto", height: number | "auto", top: number, left: number }>,
    classes?: string[],
    enforceSingleInstance?: boolean,
    editModeOptions?: EditModeOptions,
    Component: React.FC<any>
}

export abstract class VagabondApplication extends foundry.applications.api.ApplicationV2 {
    Component: FC
    editModeOptions: EditModeOptions
    protected SYSTEM_ID = "vagabond-lite" as any

    private _reactRoot: Root | null = null
    private static _openAppsRegistry = new Map<any, VagabondApplication>()
    private enforceSingleInstance: boolean

    static override DEFAULT_OPTIONS: Partial<typeof foundry.applications.api.ApplicationV2["DEFAULT_OPTIONS"]> = {
        window: { title: "", minimizable: true, resizable: true },
        position: {
            width: 550,
            height: "auto",
            top: 120,
            left: 200
        },
        classes: []
    }

    constructor(args: VagabondAppArgs) {
        super(
            structuredClone({
                window: {
                    ...VagabondApplication.DEFAULT_OPTIONS.window, ...args.window
                },
                position: {
                    ...VagabondApplication.DEFAULT_OPTIONS.position, ...args.position
                },
                classes: [
                    ...args?.classes ?? []
                ]
            }),
        )

        this.Component = args.Component
        this.editModeOptions = args.editModeOptions ?? EditModeOptions.NEVER
        this.enforceSingleInstance = args.enforceSingleInstance ?? true

        /**
         * Check that the user doesn't already have the app open by comparing it
         * to the custom _openAppsRegistry.
         */
        if (this.enforceSingleInstance) {
            const Constructor = this.constructor
            const existing = VagabondApplication._openAppsRegistry.get(Constructor)
            const isExistingClosing = (existing?.state as any) === "CLOSING" || (existing as any)?._state === 4

            if (existing && !isExistingClosing) {
                existing.bringToFront();
                (this as any)._state = 5
            }
            else {
                VagabondApplication._openAppsRegistry.set(Constructor, this)
            }
        }
    }

    /**
     * Prevent Foundry from opening the same app more than once per user.
     * @param options
     * @returns 
     */
    protected override _canRender(options: any): false | void {
        if (super._canRender(options) === false) return false
        if (this.enforceSingleInstance) {
            const Constructor = this.constructor
            const currentActive = VagabondApplication._openAppsRegistry.get(Constructor)
            if (currentActive && currentActive.id !== this.id) {
                currentActive.bringToFront()
                return false
            }
        }
        return
    }

    async _renderHTML(): Promise<void | string | HTMLElement> {
        sheetUtils.onRenderHTML(this as any)
    }

    _replaceHTML(result: HTMLElement | string, content: HTMLElement, options: any) {
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
        if (this.enforceSingleInstance) {
            const Constructor = this.constructor
            if (VagabondApplication._openAppsRegistry.get(Constructor) === this) {
                VagabondApplication._openAppsRegistry.delete(Constructor)
            }
        }

        if (this._reactRoot) {
            this._reactRoot.unmount()
            this._reactRoot = null
        }

        if (this.element) {
            this.element.style.transition = "none"
            this.element.style.animation = "none"
        }

        super._onClose(options)
    }

    protected async _animateClose(): Promise<void> {
        return
    }

}