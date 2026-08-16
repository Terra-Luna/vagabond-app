import { VagabondAppArgs, VagabondApplication } from "../../VagabondApplication"
import { XpQuestionnairePlayerView } from "./XpQuestionnairePlayerView"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { getXpQuestionnaiare } from "../../vagabond-tools/usecase/VagabondSettingsHelper"

export class XpQuestionnairePlayerApp extends VagabondApplication {

    private actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        const appArgs: VagabondAppArgs = {
            window: {
                title: "Earn XP",
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
            ui.notifications?.info(`Applied ${xp}XP to ${this.actor.name}!`)
        }
        this.close()
    }
    
}