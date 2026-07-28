import { XpQuestion, XpQuestionnaireConfigView } from "./XpQuestionnaireConfigView"
import { VagabondLiteApplication } from "../../VagabondLiteApplication"

export class XPQuestionnaireConfig extends VagabondLiteApplication {

    constructor() {
        const currentQuestions = (game as any).settings.get("vagabond-lite", "xp-questionnaire") as XpQuestion[] || []
        const title = "Manage XP Questionnaire"
        const xpQView = <XpQuestionnaireConfigView
            initialQuestions={currentQuestions}
            onSave={(updatedQuestions) => this.handleSave(updatedQuestions)}
        />
        super({ title: title, isResizeable: false, Component: xpQView })
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