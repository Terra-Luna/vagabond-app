import { ReactNode } from "react"
import { createRoot, Root } from "react-dom/client"
import { vgLiteStyles } from "../utils/styleUtils"
import { DimensionsContext } from "../view/context/DimensionsContext"
import { EditModeContextProvider } from "../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../view/context/EditModeContext/EditModeOptions"
import { EmotionCacheContext } from "../view/context/EmotionCacheContext"
import { FoundryHotkeyBlocker } from "../view/component/FoundryHotkeyBlocker"

export interface VagabondLiteAppArgs {
    title?: string,
    isResizeable?: boolean,
    editModeOptions?: EditModeOptions,
    Component: ReactNode
}

export abstract class VagabondLiteApplication extends foundry.applications.api.ApplicationV2 {

    Component: ReactNode
    editModeOptions: EditModeOptions
    
    constructor(args: VagabondLiteAppArgs) {
        super({ window: { title: args.title ?? '', resizable: args.isResizeable ?? false } })
        this.Component = args.Component
        this.editModeOptions = args.editModeOptions ?? EditModeOptions.NEVER
    }

    private _reactRoot: Root | null = null

    static override DEFAULT_OPTIONS: Partial<typeof foundry.applications.api.ApplicationV2["DEFAULT_OPTIONS"]> = {
        window: {
            minimizable: true
        },
        position: {
            width: 550,
            height: "auto"
        }
    }

    protected override async _renderHTML(context: any, options: any): Promise<HTMLElement> {
        const hostElement = document.createElement("div")
        const scaduRoot = hostElement.attachShadow({ mode: "open" })
        const innerDiv = document.createElement("div")
        scaduRoot.appendChild(innerDiv)

        this._reactRoot = createRoot(innerDiv)
        this._reactRoot.render(
            <FoundryHotkeyBlocker>
                <DimensionsContext.Provider value={this.position as any}>
                    <EditModeContextProvider initialEditMode={this.editModeOptions}>
                                <EmotionCacheContext scaduRoot={scaduRoot}>
                                    <div className={`${(game.settings as any).get("core", "uiConfig").colorScheme.applications}`}>
                                        <style>{vgLiteStyles}</style>
                                {this.Component}
                                    </div>
                        </EmotionCacheContext>
                    </EditModeContextProvider>
                </DimensionsContext.Provider>
            </FoundryHotkeyBlocker>
        )

        return hostElement
    }

    protected override _replaceHTML(result: HTMLElement, content: HTMLElement, options: any): void {
        content.innerHTML = ""
        content.append(result)
    }

    protected override async _onClose(options): Promise<void> {
        if (this._reactRoot) {
            this._reactRoot.unmount()
            this._reactRoot = null
        }
        await super._onClose(options)
    }
    
}