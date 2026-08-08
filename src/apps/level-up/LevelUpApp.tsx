import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { getClonedFlags, savePerkSelectionFlags } from "../../rules/util/item-rules-util"
import { VagabondLiteApplication, VagabondLiteAppArgs } from "../VagabondLiteApplication"
import { LevelUpView } from "./LevelUpView"

export class LevelUpApp extends VagabondLiteApplication {

    private actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        const appArgs: VagabondLiteAppArgs = {
            position: {
                width: 750,
                height: "auto"
            },
            window: {
                title: "Level Up!",
                resizable: true
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
            onSave: (args: {
                advancement?: PerkBonusSelection,
                spell?: PerkBonusSelection,
                perkTraining?: PerkBonusSelection,
                isComplete?: boolean
            }) => this.handleSave(args)
        }
    }

    /**
     * Persists changes directly to the World Scope configuration DB.
     */
    private async handleSave(args: {
        advancement?: PerkBonusSelection,
        spell?: PerkBonusSelection,
        perkTraining?: PerkBonusSelection,
        isComplete?: boolean
    }): Promise<void> {
        if (args.isComplete) {
            const level = this.actor.system.level
            await this.actor.update({
                'system.level.current': (level.current ?? 0) + 1,
                'system.level.xp': (level.xp ?? 0) - (level.xpToLevel ?? 0)
            } as Record<string, number>)

            /**
             * Merges any new perk bonus choices into their existing flags...
             */
            if (args.advancement || args.perkTraining || args.spell) {
                const flags = getClonedFlags(this.actor)
                const slots = Object.entries(flags).flatMap(([ruleId, values]) =>
                    values.map(value => ({ ruleId, value }))
                )

                if (args.advancement) {
                    await savePerkSelectionFlags(this.actor, [...slots.filter(s => s.ruleId === args.advancement?.ruleId), args.advancement])
                }
                if (args.perkTraining) {
                    await savePerkSelectionFlags(this.actor, [...slots.filter(s => s.ruleId === args.perkTraining?.ruleId), args.perkTraining])
                }
                if (args.spell) {
                    await savePerkSelectionFlags(this.actor, [...slots.filter(s => s.ruleId === args.spell?.ruleId), args.spell])
                }
            }

            await this.actor.update({
                'system.health.current': this.actor.system.health.max,
                'system.mana.current': this.actor.system.mana.max,
                'system.statuses.counters.luck': this.actor.system.stats.luck
            } as Record<any, any>)
        }
        this.close()
    }
    
}

export interface PerkBonusSelection { value: string, ruleId: string }