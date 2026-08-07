import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondLiteApplication, VagabondLiteAppArgs } from "../VagabondLiteApplication"
import { LevelUpView } from "./LevelUpView"

export class LevelUpApp extends VagabondLiteApplication {

    private actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        const appArgs: VagabondLiteAppArgs = {
            position: {
                width: 440,
                height: "auto"
            },
            window: {
                title: "Level Up!",
                resizable: false
            },
            Component: LevelUpView
        }
        super(appArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
            onSave: (isComplete: boolean) => this.handleSave(isComplete)
        }
    }

    /**
     * Persists changes directly to the World Scope configuration DB.
     */
    private async handleSave(isComplete?: boolean): Promise<void> {
        if (isComplete) {
            const level = this.actor.system.level
            await this.actor.update({
                'system.level.current': (level.current ?? 0) + 1,
                'system.level.xp': (level.xp ?? 0) - (level.xpToLevel ?? 0)
            } as Record<string, number>)
        }
        this.close()
    }
    
}