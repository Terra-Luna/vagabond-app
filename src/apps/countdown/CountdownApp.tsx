 
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { VagabondCanvasOverlayApp } from "../overlay/CanvasOverlayApp"
import { CountdownAppView } from "./CountdownAppView"

export class CountdownApp extends VagabondCanvasOverlayApp {

    constructor() {
        super({
            window: CountdownApp.DEFAULT_OPTIONS.window,
            position: CountdownApp.DEFAULT_OPTIONS.position,
            editModeOptions: EditModeOptions.NEVER,
            Component: CountdownAppView
        }, "countdown-canvas-overlay-viewport-anchor")
    }

}