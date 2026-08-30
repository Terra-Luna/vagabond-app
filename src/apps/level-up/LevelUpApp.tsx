import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { savePerkSelections } from "../../rules/util/item-rules-util"
import { VagabondAppArgs,VagabondApplication } from "../VagabondApplication"
import { LevelUpArgs, LevelUpView } from "./LevelUpView"

export const getBonusSelections = (args: LevelUpArgs) => [
    ...(args.advancements ?? (args.advancement ? [args.advancement] : [])),
    ...(args.perkTrainings ?? (args.perkTraining ? [args.perkTraining] : [])),
    ...(args.reasonTrainings ?? (args.reasonTraining ? [args.reasonTraining] : [])),
    ...(args.spells ?? (args.spell ? [args.spell] : []))
].filter((selection): selection is NonNullable<typeof selection> => !!selection && !!selection.value)

export class LevelUpApp extends VagabondApplication {

    private actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        const appArgs: VagabondAppArgs = {
            position: {
                width: 1533,
                height: 980,
                top: 20,
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

            if (args.newRsnTraining) {
                updates[`system.skills.${args.newRsnTraining}.isTrained`] = true
            }

            /**
             * Merges any new perk bonus choices into their existing flags...
             */
            if (args.advancement || args.perkTraining || args.reasonTraining || args.spell) {
                const bonusSelections = getBonusSelections(args)
                await savePerkSelections(this.actor, bonusSelections)
            }

            await this.actor.update(updates)

            // Give Hero a "full rest" after level-up to update attributes to new max's.
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