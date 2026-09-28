import { appLang } from "../../utils/lang"
import { fields, requiredString } from "../common/sharedSchemas"
import { armorSchema } from "./type/Armor"
import { healthSchema } from "./type/Health"
import { modifierSchema } from "./type/Modifiers"
import { statusFxSchema } from "./type/StatusFx"

export const baseActorSchema = () => {
    return {
        health: new fields.SchemaField({ ...healthSchema() }),
        armor: new fields.SchemaField({ ...armorSchema() }),
        senses: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(appLang.Senses) })),
        statuses: new fields.SchemaField({ ...statusFxSchema() }),
        modifiers: new fields.SchemaField({ ...modifierSchema() }),

        // Used to force updates on the actor's UI when certain changes occur.
        forceUpdateTrack: new fields.BooleanField({ initial: false })
    }
}

export type BaseActorSchema = ReturnType<typeof baseActorSchema>

export abstract class ActorDataModel<T extends BaseActorSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return {
            ...baseActorSchema()
        }
    }

    /**
     * Required by a few edge cases, this forces the actor to update its UI by
     * toggling the forceUpdateTrack field.
     */
    async forceUpdate() {
        this.parent.update({ system: { forceUpdateTrack: !this.forceUpdateTrack } })
    }

    override async _onUpdate(changes, options, userId) {
        super._onUpdate(changes, options, userId)

        /**
         * Mark an actor as Dead when their HP hits zero...
         */
        if (game.user?.isActiveGM) {
            const hpValue = foundry.utils.getProperty(changes, "system.health.value") as number | undefined
            if (hpValue !== undefined) {
                if (hpValue <= 0) {
                    if (!this.statuses.toggles.dead) {
                        await this.parent.toggleStatusEffect("dead", { active: true, overlay: true })
                    }
                }
                else if (this.health.max > 0) {
                    if (this.statuses.toggles.dead) {
                        await this.parent.toggleStatusEffect("dead", { active: false, overlay: false })
                    }
                }
            }
        }
    }
}