import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { fields, requiredString } from "../common/sharedSchemas"
import { armorSchema } from "./type/Armor"
import { healthSchema } from "./type/Health"
import { modifierSchema } from "./type/Modifiers"
import { PolymorphFlag } from "./type/PolymorphFlag"
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

    /**
        The Target becomes a Beast of your choice with HD no higher than your Level for the duration.
        If the Target is unwilling and its HD are higher than your Level, the Spell fails. During this
        time, the Target uses:

        • The Beast's Speed, Passives, Senses, Armor, Immune, Weak, Actions, and Abilities.
        • The Target's HP and, if possible, its Actions and Abilities.

        You must spend 1 Mana on your Turns to Focus on this Spell, even for willing Targets.

        Overridden by HeroDataModel.
     */
    async setPolymorph(polyFlag: PolymorphFlag | undefined) {
        if (["adversary", "npc"].includes(this.parent.type)) {
            if (polyFlag && Object.keys(polyFlag).length > 0) {
                const originalSystem = { ...this, name: this.parent.name, img: this.parent.img }
                await this.parent.setFlag(sys_id, "originalSystem", originalSystem)
                await this.parent.update({
                    "name": `${polyFlag.statBlock.name} (${this.parent.name})`,
                    "system": {
                        ...polyFlag.statBlock.system,
                        health: { ...this.health },
                        hitDice: (this as any).hitDice
                    }
                })
                await this.setPolymorphActiveEffect(polyFlag)
                await this.swapTokenImages(polyFlag)
            }
            else {
                const originalSystem = await this.parent.getFlag(sys_id, "originalSystem")
                if (originalSystem) {
                    await this.parent.update({
                        "name": originalSystem.name,
                        "system": {
                            ...originalSystem,
                            health: { ...this.health }
                        }
                    })
                }

                const oldEffects = this.parent?.effects?.filter(eff => eff.getFlag(sys_id, "polymorph"))?.map(eff => eff.id) ?? []
                await this.deletePolymorphEffects(oldEffects)
                await this.swapTokenImages(undefined)
            }
        }
    }

    async swapTokenImages(polyFlag: PolymorphFlag | undefined) {
        const tokenDocs = this.parent.getActiveTokens(false, true) as any[]
        for (const tokenDoc of tokenDocs) {
            const original = tokenDoc.getFlag(sys_id, "originalTokenImg") as { src: string, ring: string } | undefined
            if (polyFlag) {
                const src = polyFlag.statBlock.tokenImg
                if (!src) continue
                if (!original) {
                    await tokenDoc.setFlag(sys_id, "originalTokenImg", { src: tokenDoc.texture.src, ring: tokenDoc.ring?.subject?.texture ?? "" })
                }

                await tokenDoc.update({
                    "texture.src": src,
                    ...(tokenDoc.ring?.enabled ? { "ring.subject.texture": src } : {})
                })
            }
            else if (original) {
                await tokenDoc.update({
                    "texture.src": original.src,
                    ...(tokenDoc.ring?.enabled ? { "ring.subject.texture": original.ring } : {})
                })
                await tokenDoc.unsetFlag(sys_id, "originalTokenImg")
            }
        }
    }

    async setPolymorphActiveEffect(polyFlag: PolymorphFlag, changes?: any[]) {
        const oldPolymorphEffects = this.parent?.effects?.filter(eff => eff.getFlag(sys_id, "polymorph"))?.map(eff => eff.id) ?? []
        const polymorphEffect = {
            name: "Polymorph: " + polyFlag.statBlock.name,
            img: "/icons/creatures/amphibians/bullfrog-glass-teal.webp",
            showIcon: 2,
            flags: { [sys_id]: { polymorph: true } },
            changes: changes ?? []
        }

        await this.setPolymorphFlag(polyFlag)

        if (oldPolymorphEffects.length) {
            await this.deletePolymorphEffects(oldPolymorphEffects)
        }

        await this.parent?.createEmbeddedDocuments("ActiveEffect", [polymorphEffect])
    }

    /**
     * Delete polymorph effects one at a time. An effect may already be gone from the database
     * (e.g. a stale local copy or a concurrent cancel), which makes a batched delete throw and
     * abort the whole polymorph change, so missing effects are skipped.
     */
    async deletePolymorphEffects(ids: (string | null)[]) {
        for (const id of ids) {
            if (!id || !this.parent?.effects?.has(id)) continue
            try {
                await this.parent.deleteEmbeddedDocuments("ActiveEffect", [id])
            }
            catch (error) {
                console.warn(`Unable to delete polymorph effect ${id}`, error)
            }
        }
    }

    async setPolymorphFlag(polyFlag: PolymorphFlag | undefined) {
        if (polyFlag) {
            await this.parent.setFlag(sys_id, "polymorph", polyFlag)
        }
        else {
            await this.parent.unsetFlag(sys_id, "polymorph")
        }
    }

    get polymorph(): PolymorphFlag | undefined {
        return this.parent.getFlag(sys_id, "polymorph")
    }

}