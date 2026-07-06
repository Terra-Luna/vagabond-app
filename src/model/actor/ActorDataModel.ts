import { lang } from "../../utils/lang"
import { fields, requiredString } from "../common/sharedSchemas"
import { armorSchema } from "./type/Armor"
import { healthSchema } from "./type/Health"

export const baseActorSchema = () => {
    return {
        health: new fields.SchemaField({ ...healthSchema() }),
        armor: new fields.SchemaField({ ...armorSchema() }),
        senses: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Senses) }))
    }
}

export type BaseActorSchema = ReturnType<typeof baseActorSchema>

export abstract class ActorDataModel<T extends BaseActorSchema> extends foundry.abstract.TypeDataModel<T, any> {
    static defineSchema() {
        return {
            ...baseActorSchema()
        }
    }

    override async _onUpdate(changes, options, userId) {
        super._onUpdate(changes, options, userId)

        /**
         * Mark an actor as Dead when their HP hits zero...
         */
        const hpValue = foundry.utils.getProperty(changes, "system.health.current") as number | undefined
        if (hpValue !== undefined) {
            const isDead = this.parent.statuses.has("dead")
            if (hpValue <= 0) {
                if (!isDead) {
                    await this.parent.toggleStatusEffect("dead", { active: true, overlay: true })
                }
            }
            else {
                if (isDead) {
                    await this.parent.toggleStatusEffect("dead", { active: false, overlay: false })
                }
            }
        }
    }
}