import { lang } from "../../utils/lang"
import { fields, requiredString } from "../common/sharedSchemas"
import { armorSchema } from "./type/Armor"
import { healthSchema } from "./type/Health"
import { modifierSchema } from "./type/Modifiers"
import { statusFxSchema } from "./type/StatusFx"

export const baseActorSchema = () => {
    return {
        health: new fields.SchemaField({ ...healthSchema() }),
        armor: new fields.SchemaField({ ...armorSchema() }),
        senses: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Senses) })),
        statuses: new fields.SchemaField({ ...statusFxSchema() }),
        modifiers: new fields.SchemaField({ ...modifierSchema() })
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
        if (game.user?.isGM || game.user?.isActiveGM || game.user?.isOwner) {
            const hpValue = foundry.utils.getProperty(changes, "system.health.current") as number | undefined
            if (hpValue !== undefined) {
                if (hpValue <= 0) {
                    if (!this.statuses.toggles.dead) {
                        await this.parent.toggleStatusEffect("dead", { active: true, overlay: true })
                    }
                }
                else {
                    if (this.statuses.toggles.dead) {
                        await this.parent.toggleStatusEffect("dead", { active: false, overlay: false })
                    }
                }
            }
        }
    }

}