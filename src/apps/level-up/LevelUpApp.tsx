import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { getClonedFlags, savePerkSelectionFlags } from "../../rules/util/item-rules-util"
import { VagabondApplication, VagabondAppArgs } from "../VagabondApplication"
import { LevelUpArgs, LevelUpView } from "./LevelUpView"

export class LevelUpApp extends VagabondApplication {

    private actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        const appArgs: VagabondAppArgs = {
            position: {
                width: 855,
                height: 840,
                top: 0,
                left: 60
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
            onSave: (args: LevelUpArgs) => this.handleSave(args)
        }
    }

    /**
     * Persists changes directly to the World Scope configuration DB.
     */
    private async handleSave(args: LevelUpArgs): Promise<void> {
        if (args.isComplete) {
            const level = this.actor.system.level

            const updates: Record<string, any> = {
                'system.level.current': (level.current ?? 0) + 1,
                'system.level.xp': (level.xp ?? 0) - (level.xpToLevel ?? 0)
            }

            if (args.levelUpStat) {
                // Use _source here to get their true database stat value (no modifiers).
                const currentValue = this.actor._source.system.stats[args.levelUpStat] ?? 0
                updates[`system.stats.${args.levelUpStat}`] = currentValue + 1
            }

            await this.actor.update(updates)

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
            } as Record<any, any>,
                { ['skipTrackerChatCard' as string]: true }
            )
        }
        this.close()
    }
    
}