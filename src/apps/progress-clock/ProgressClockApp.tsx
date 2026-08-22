import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { VagabondCanvasOverlayApp } from "../overlay/CanvasOverlayApp"
import { ProgressClockAppView } from "./ProgressClockAppView"

export class ProgressClockApp extends VagabondCanvasOverlayApp {

    constructor() {
        super({
            window: ProgressClockApp.DEFAULT_OPTIONS.window,
            position: ProgressClockApp.DEFAULT_OPTIONS.position,
            editModeOptions: EditModeOptions.NEVER,
            Component: ProgressClockAppView
        }, "clock-canvas-overlay-viewport-anchor")
    }

}