import { sys_id } from "../../../utils/foundryUtils"
import { appLang } from "../../../utils/lang"
import { getXpQuestionnaiare, XpQuestion } from "../../vagabond-tools/usecase/VagabondSettingsHelper"
import { VagabondAppArgs, VagabondApplication } from "../../VagabondApplication"
import { XpQuestionnaireConfigView } from "./XpQuestionnaireConfigView"

export class XpQuestionnaireConfigApp extends VagabondApplication {

    constructor() {
        const appArgs: VagabondAppArgs = {
            window: {
                title: appLang.XpQuestionnaire.manageTitle,
                resizable: false
            },
            Component: XpQuestionnaireConfigView
        }
        super(appArgs)
    }

    override getReactProps() {
        const currentQuestions = getXpQuestionnaiare()
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
            await (game as any).settings.set(sys_id, "xpQuestionnaire", updatedQuestions)
            ui.notifications?.info(appLang.XpQuestionnaire.saved)
            this.close()
        }
        catch (error) {
            console.error("Vagabond | Failed to save questionnaire configuration:", error)
            ui.notifications?.error(appLang.XpQuestionnaire.saveFailed)
        }
    }

}