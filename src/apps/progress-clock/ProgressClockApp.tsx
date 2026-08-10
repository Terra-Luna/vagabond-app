import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import ProgressClockAppView from "./ProgressClockAppView"
import { VagabondCanvasOverlayApp } from "../CanvasOverlayApp"

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