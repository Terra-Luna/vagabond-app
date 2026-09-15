import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { findOrCreateElectiveTrainingsRule, normalizeRuleSelections, randomId, saveItemRuleSelections, savePerkSelections } from "../../rules/util/item-rules-util"
import { sys_id } from "../../utils/foundryUtils"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { LevelUpArgs, LevelUpView } from "./LevelUpView"

export const getBonusSelections = (args: LevelUpArgs) => [
    ...(args.advancements ?? (args.advancement ? [args.advancement] : [])),
    ...(args.perkTrainings ?? (args.perkTraining ? [args.perkTraining] : [])),
    ...(args.spells ?? (args.spell ? [args.spell] : [])),
    ...(args.reasonTrainings ?? (args.reasonTraining ? [args.reasonTraining] : []))
].filter((selection): selection is NonNullable<typeof selection> => !!selection && !!selection.value)

export const saveElectiveTraining = async (actor: Actor & { system: HeroDataModel }, skill: string, levelUpStat?: string) => {
    const targetItem = actor.items.find(i => (i.type as string) === "class") ?? actor.items.find(i => (i.type as string) === "ancestry")
    if (!targetItem) return

    const { electiveRule } = findOrCreateElectiveTrainingsRule(targetItem, {
        reasonValue: (actor.system.stats.reason ?? 2) + (levelUpStat === 'reason' ? 1 : 0)
    })

    const currentSelections = normalizeRuleSelections(electiveRule.selections)
    const formattedSelection = skill.startsWith("skills.")
        ? (skill.endsWith(".trained") ? skill : `${skill}.trained`)
        : `skills.${skill}.trained`

    if (!currentSelections.some(s => s.value === formattedSelection)) {
        electiveRule.selections = [
            ...currentSelections,
            { id: randomId(), value: formattedSelection, subselect: "" }
        ]
        const targetRules = ((targetItem.system as any).rules ?? []) as any[]
        if (!targetRules.some(rule => rule.id === electiveRule.id)) {
            await targetItem.update({ "system.rules": [...targetRules, { ...electiveRule, selections: [] }] } as Record<string, any>)
        }
        await saveItemRuleSelections(targetItem, { [electiveRule.id]: electiveRule.selections })
    }
}

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
            this.actor.setFlag(sys_id, "destiny", false)

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
                await saveElectiveTraining(this.actor, args.newRsnTraining, args.levelUpStat)
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
                'system.health.value': this.actor.system.health.max,
                'system.mana.value': this.actor.system.mana.max,
                'system.statuses.counters.luck': this.actor.system.stats.luck
            } as Record<any, any>,
                { ['skipTrackerChatCard' as string]: true }
            )
        }
        this.close()
    }
    
}