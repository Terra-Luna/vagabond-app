import { FC } from "react"
import { Root } from "react-dom/client"

import { sys_id } from "../utils/foundryUtils"
import * as sheetUtils from "../utils/sheetUtils"
import { EditModeOptions } from "../view/context/EditModeContext/EditModeOptions"

export interface VagabondAppArgs {
    window?: Partial<{ title: string, minimizable: boolean, resizable: boolean }>,
    position?: Partial<{ width: number | "auto", height: number | "auto", top: number, left: number }>,
    classes?: string[],
    actorId?: string,
    enforceSingleInstancePerActor?: boolean,
    enforceSingleInstance?: boolean,
    editModeOptions?: EditModeOptions,
    Component: React.FC<any>
}

export abstract class VagabondApplication extends foundry.applications.api.ApplicationV2 {
    Component: FC
    editModeOptions: EditModeOptions
    protected SYSTEM_ID = sys_id

    private _reactRoot: Root | null = null
    private static _openAppsRegistry = new Map<any, Map<string, VagabondApplication>>()
    private actorId?: string
    private enforceSingleInstancePerActor: boolean
    private enforceSingleInstance: boolean
    private onActorUpdateHook?: number

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
        this.actorId = args.actorId
        this.enforceSingleInstancePerActor = args.enforceSingleInstancePerActor ?? true
        this.enforceSingleInstance = args.enforceSingleInstance ?? true

        /**
         * Check that the user doesn't already have the app open by comparing it
         * to the custom _openAppsRegistry.
         */
        if (this.isSingleInstance) {
            const existing = this.registeredInstance
            const isExistingClosing = (existing?.state as any) === "CLOSING" || (existing as any)?._state === 4

            if (existing && !isExistingClosing) {
                existing.bringToFront();
                (this as any)._state = 5
            }
            else {
                this.registerInstance()
            }
        }

        if (this.usesActorScope) {
            this.onActorUpdateHook = Hooks.on("updateActor", (actor) => {
                if (this.actorId === actor.id) {
                    if (this.rendered) this.render({ force: false })
                }
            })
        }
    }

    private get usesActorScope(): boolean {
        return this.enforceSingleInstancePerActor && Boolean(this.actorId)
    }

    private get isSingleInstance(): boolean {
        return this.usesActorScope || this.enforceSingleInstance
    }

    private get registryKey(): string {
        return this.usesActorScope ? this.actorId! : ""
    }

    private get registeredInstance(): VagabondApplication | undefined {
        return VagabondApplication._openAppsRegistry.get(this.constructor)?.get(this.registryKey)
    }

    private registerInstance() {
        const byKey = VagabondApplication._openAppsRegistry.get(this.constructor) ?? new Map<string, VagabondApplication>()
        byKey.set(this.registryKey, this)
        VagabondApplication._openAppsRegistry.set(this.constructor, byKey)
    }

    /**
     * Prevent Foundry from opening the same app more than once per user
     * (or per actor, when enforceSingleInstancePerActor applies).
     * @param options
     * @returns 
     */
    protected override _canRender(options: any): false | void {
        if (super._canRender(options) === false) return false
        if (this.isSingleInstance) {
            const currentActive = this.registeredInstance
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

    /**
     * Changes to the app's associated Actor could trigger the app to re-launch
     * if those changes are still taking place as it's closing - so hook-off the
     * Actor to prevent this from happening.
     */
    override async close(options?: any) {
        this.removeActorUpdateHook()
        return super.close(options)
    }

    protected override _onClose(options): void {
        if (this.isSingleInstance && this.registeredInstance === this) {
            VagabondApplication._openAppsRegistry.get(this.constructor)?.delete(this.registryKey)
        }

        if (this._reactRoot) {
            this._reactRoot.unmount()
            this._reactRoot = null
        }

        if (this.element) {
            this.element.style.transition = "none"
            this.element.style.animation = "none"
        }

        this.removeActorUpdateHook()

        super._onClose(options)
    }

    private removeActorUpdateHook() {
        if (this.onActorUpdateHook !== undefined) {
            Hooks.off("updateActor", this.onActorUpdateHook)
            this.onActorUpdateHook = undefined
        }
    }

    protected async _animateClose(): Promise<void> {
        return
    }

    protected _onDetach(sourceDocument, targetDocument) {
        sheetUtils.onDetach(this as any, sourceDocument, targetDocument)
    }
}