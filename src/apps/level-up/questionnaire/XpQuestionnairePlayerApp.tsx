import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { appLang } from "../../../utils/lang"
import { localizeString } from "../../../utils/localeUtils"
import { getXpQuestionnaiare } from "../../vagabond-tools/usecase/VagabondSettingsHelper"
import { VagabondAppArgs, VagabondApplication } from "../../VagabondApplication"
import { XpQuestionnairePlayerView } from "./XpQuestionnairePlayerView"

export class XpQuestionnairePlayerApp extends VagabondApplication {

    private actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        const appArgs: VagabondAppArgs = {
            window: {
                title: appLang.LevelUp.xpQuestionnaireTitle,
                resizable: false
            },
            Component: XpQuestionnairePlayerView
        }
        super(appArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            questions: getXpQuestionnaiare(),
            onSave: (xp: number) => this.handleSave(xp)
        }
    }

    /**
     * Persists changes directly to the World Scope configuration DB.
     */
    private async handleSave(xp: number): Promise<void> {
        if (xp > 0) {
            const currentXp = this.actor.system.level.xp ?? 0
            await this.actor.update({ 'system.level.xp': currentXp + xp } as Record<string, number>)
            ui.notifications?.info(localizeString(appLang.LevelUp.xpApplied, { xp: xp.toString(), name: this.actor.name }))
        }
        this.close()
    }

}