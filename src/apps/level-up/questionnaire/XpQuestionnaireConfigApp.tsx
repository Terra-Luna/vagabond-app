import { XpQuestion, XpQuestionnaireConfigView } from "./XpQuestionnaireConfigView"
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../../VagabondLiteApplication"

export class XpQuestionnaireConfigApp extends VagabondLiteApplication {

    constructor() {
        const appArgs: VagabondLiteAppArgs = {
            window: {
                title: "Manage XP Questionnaire",
                resizable: false
            },
            Component: XpQuestionnaireConfigView
        }
        super(appArgs)
    }

    override getReactProps() {
        const currentQuestions = (game as any).settings.get("vagabond-lite", "xp-questionnaire") as XpQuestion[] || []
        return {
            ...super.getReactProps(),
            initialQuestions: currentQuestions,
            onSave: (updatedQuestions: XpQuestion[]) => this.handleSave(updatedQuestions)
        }
    }

    /**
     * Persists changes directly to the World Scope configuration DB.
     */
    private async handleSave(updatedQuestions: XpQuestion[]): Promise<void> {
        try {
            await (game as any).settings.set("vagabond-lite", "xp-questionnaire", updatedQuestions)
            ui.notifications?.info("XP Questionnaire settings saved successfully!")
            this.close()
        }
        catch (error) {
            console.error("Vagabond Lite | Failed to save questionnaire configuration:", error)
            ui.notifications?.error("Failed to save changes to the database.")
        }
    }
    
}