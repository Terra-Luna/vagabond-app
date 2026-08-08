import { getXpCurve, setXpCurve, XpCurve } from "../../vagabond-tools/VagabondSettingsRegistry"
import { VagabondLiteApplication, VagabondLiteAppArgs } from "../../VagabondLiteApplication"
import { XpProgressionCurveView } from "./XpProgressionCurveView"

export class XpProgressionCurveApp extends VagabondLiteApplication {

    constructor() {
        const appArgs: VagabondLiteAppArgs = {
            position: {
                height: "auto",
                width: 250
            },
            window: {
                title: "Hero Level Progression Curve",
                resizable: false
            },
            Component: XpProgressionCurveView
        }
        super(appArgs)
    }

    override getReactProps() {
        const initialCurve = getXpCurve()
        return {
            ...super.getReactProps(),
            initialCurve: initialCurve,
            onSave: (curve: XpCurve[]) => this.handleSave(curve)
        }
    }

    /**
     * Persists changes directly to the World Scope configuration DB.
     */
    private async handleSave(curve: XpCurve[]): Promise<void> {
        try {
            setXpCurve(curve)
            ui.notifications?.info("XP curve settings saved successfully!")
            this.close()
        }
        catch (error) {
            console.error("Vagabond | Failed to save XP curve configuration:", error)
            ui.notifications?.error("Failed to save changes to the database.")
        }
    }

}