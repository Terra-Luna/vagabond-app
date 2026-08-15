import { ActiveEffectDataModel } from "../../model/effect/ActiveEffectDataModel"
import { EquipmentDataModel } from "../../model/item/equip/EquipmentDataModel"
import { vgLiteLang } from "../../utils/lang";

/**
 * The static effects' names and descriptions can be displayed to a GM user when configuring
 * active effects for Classes, Ancestries, Equipment, etc... On-save, the path property can 
 * be used to apply the effect via #addActiveEffect(), below.
 */
export class VagabondActiveEffect<SubType extends ActiveEffect.SubType = ActiveEffect.SubType> extends ActiveEffect<SubType> {

    static statusEffects = [
        {
            _id: "vgliteberserk000",
            id: "berserk",
            name: "VGLITE.StatusConditions.berserk.name",
            img: "icons/svg/explosion.svg",
            changes: [{ key: "system.statuses.toggles.berserk", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteblinded000",
            id: "blinded",
            name: "VGLITE.StatusConditions.blinded.name",
            img: "icons/svg/blind.svg",
            changes: [
                { key: "system.statuses.toggles.blinded", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vgliteburning000",
            id: "burning",
            name: "VGLITE.StatusConditions.burning.name",
            img: "icons/svg/fire.svg",
            changes: [
                { key: "system.statuses.stacks.burning", mode: "ADD", value: JSON.stringify({ duration: 4, damageType: "fire" }) }
            ]
        },
        {
            _id: "vglitecharmed000",
            id: "charmed",
            name: "VGLITE.StatusConditions.charmed.name",
            img: "icons/svg/heal.svg",
            changes: [{ key: "system.statuses.toggles.charmed", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteconfused00",
            id: "confused",
            name: "VGLITE.StatusConditions.confused.name",
            img: "icons/svg/stoned.svg",
            changes: [{ key: "system.statuses.toggles.confused", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vglitedazed00000",
            id: "dazed",
            name: "VGLITE.StatusConditions.dazed.name",
            img: "icons/svg/daze.svg",
            changes: [{ key: "system.statuses.toggles.dazed", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vglitefatigued00",
            id: "fatigued",
            name: "VGLITE.StatusConditions.fatigued.name",
            img: "icons/svg/downgrade.svg",
            changes: [{ key: "system.counters.statuses.fatigue", mode: "ADD", value: "1" }]
        },
        {
            _id: "vglitefrighten00",
            id: "frightened",
            name: "VGLITE.StatusConditions.frightened.name",
            img: "icons/svg/terror.svg",
            changes: [
                { key: "system.statuses.toggles.frightened", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.damage.out.all", mode: "ADD", value: "-2" }
            ]
        },
        {
            _id: "vgliteincapacit0",
            id: "incapacitated",
            name: "VGLITE.StatusConditions.incapacitated.name",
            img: "icons/svg/falling.svg",
            changes: [
                { key: "system.statuses.toggles.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vgliteinvisible0",
            id: "invisible",
            name: "VGLITE.StatusConditions.invisible.name",
            img: "icons/svg/invisible.svg",
            changes: [{ key: "system.statuses.toggles.invisible", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteparalyzed0",
            id: "paralyzed",
            name: "VGLITE.StatusConditions.paralyzed.name",
            img: "icons/svg/paralysis.svg",
            changes: [
                { key: "system.statuses.toggles.paralyzed", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.attributes.speed.value", mode: "OVERRIDE", value: "0" }
            ]
        },
        {
            _id: "vgliteprone00000",
            id: "prone",
            name: "VGLITE.StatusConditions.prone.name",
            img: "icons/svg/wall-direction.svg",
            changes: [{ key: "system.statuses.toggles.prone", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliterestrained",
            id: "restrained",
            name: "VGLITE.StatusConditions.restrained.name",
            img: "icons/svg/net.svg",
            changes: [
                { key: "system.statuses.toggles.restrained", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" },
                { key: "system.attributes.speed.value", mode: "OVERRIDE", value: "0" }
            ]
        },
        {
            _id: "vglitesickened00",
            id: "sickened",
            name: "VGLITE.StatusConditions.sickened.name",
            img: "icons/svg/poison.svg",
            changes: [
                { key: "system.statuses.toggles.sickened", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.healing.in", mode: "ADD", value: "-2" }
            ]
        },
        {
            _id: "vglitesuffocatin",
            id: "suffocating",
            name: "VGLITE.StatusConditions.suffocating.name",
            img: "icons/svg/silenced.svg",
            changes: [{ key: "system.statuses.toggles.suffocating", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteunconsciou",
            id: "unconscious",
            name: "VGLITE.StatusConditions.unconscious.name",
            img: "icons/svg/unconscious.svg",
            changes: [
                { key: "system.statuses.toggles.unconscious", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.blinded", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.prone", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vglitevulnerable",
            id: "vulnerable",
            name: "VGLITE.StatusConditions.vulnerable.name",
            img: "icons/svg/target.svg",
            changes: [{ key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vglitedead000000",
            id: "dead",
            name: "VGLITE.StatusConditions.dead.name",
            img: "icons/svg/skull.svg",
            changes: [{ key: "system.statuses.toggles.dead", mode: "OVERRIDE", value: "true" }]
        }
    ]

    /**
     * Intercepts when an effect is created so the canvas scrolling text 
     * for modifications and token status updates reads correctly.
     */
    protected override _onCreate(data: any, options: any, userId: string): void {
        if (userId === game.userId && game.i18n?.has(this.name)) {
            const rawName = this.name;
            (this as any).name = game.i18n.localize(rawName)
            super._onCreate(data, options, userId);
            (this as any).name = rawName
        }
        else {
            super._onCreate(data, options, userId)
        }
    }

    /**
     * Intercepts when an effect is modified (like toggling it back on) so the 
     * canvas scrolling text for modifications and token status updates reads
     * correctly.
     */
    protected override _onUpdate(changed: any, options: any, userId: string): void {
        if (userId === game.userId && game.i18n?.has(this.name)) {
            const rawName = this.name;
            (this as any).name = game.i18n.localize(rawName)
            super._onUpdate(changed, options, userId);
            (this as any).name = rawName
        }
        else {
            super._onUpdate(changed, options, userId)
        }
    }

    static override async fromStatusEffect(statusId: string, options: Record<string, any> = {}): Promise<any> {
        const statusBlueprint = this.statusEffects.find(e => e.id === statusId)
        if (!statusBlueprint) return super.fromStatusEffect(statusId, options)

        // Handle special stackable burning effect!
        // Duration & damageType are embedded into the options arg as: { duration: 4, damageType: "fire" }
        if (statusId === "burning") {
            const createData = foundry.utils.deepClone(statusBlueprint)
            createData._id = foundry.utils.randomID(16)
            const duration = options.duration || 4
            const dmgType = options.damageType || "fire"

            const stackChange = createData?.changes?.find(
                (c: any) => c.key === "system.statuses.stacks.burning"
            )

            if (stackChange) {
                stackChange.value = JSON.stringify({
                    duration: duration,
                    damageType: dmgType,
                    sourceUuid: options.origin || ""
                })
            }

            const effectInstance = new this(createData as any, options)
            return effectInstance
        }

        return super.fromStatusEffect(statusId, options)
    }

    override get isSuppressed(): boolean {
        if (super.isSuppressed) return true

        /**
         * For active effects attached to Equipment, check their
         * requiresEquip property and conditionally override this
         * function.
         */
        if (this.parent instanceof Item &&
            this.parent.system instanceof EquipmentDataModel &&
            this.system instanceof ActiveEffectDataModel &&
            this.system.requiresEquip
        ) {
            return !this.parent.system.isEquipped
        }

        return false
    }

    /**
     * Burn is allowed to stack once per damage type. If the incoming duration is
     * greater than the current, it will be promoted to the higher value. Else, it's
     * ignored.
     * @param actor
     * @param data 
     * @param effect 
     * @returns 
     */
    static handleBurnStackApplication(actor, data, effect) {
        const incomingChanges = data.system?.changes || effect.system?.changes || []
        const burnEffect = incomingChanges.find((c: any) => c.key === "system.statuses.stacks.burning")

        if (burnEffect) {
            const changeValue = burnEffect.value || {}
            const incomingDuration = changeValue.duration || 4
            const incomingDmgType = changeValue.damageType || "fire"

            if (Array.isArray(actor.effects?.contents)) {
                const existingBurnEffect = actor.effects.contents.find((eff: any) => {
                    // Check whether the actor is already Burning.
                    const hasStatus = eff.statuses?.has("burning") || eff.id === "burning" || eff.key === "burning"
                    if (eff.disabled || !hasStatus || eff.id === data._id) return false

                    const activeChanges = eff.system?.changes || eff.changes || []
                    const existingChange = activeChanges.find((c: any) => c.key === "system.statuses.stacks.burning")
                    if (!existingChange?.value) return false

                    const val = existingChange.value
                    if (typeof val === "object" && val !== null) {
                        return val.damageType === incomingDmgType
                    }

                    try {
                        return JSON.parse(val).damageType === incomingDmgType
                    }
                    catch {
                        return false
                    }
                })

                /**
                 * If it's a new burning effect of a unique damage type, add it like normal, else
                 * check whether the existing instance needs to be overwritten.
                 */
                if (existingBurnEffect) {
                    /**
                     * Apply the effect only if the incoming countdown die is larger than the original, else abort.
                     */
                    try {
                        const activeChanges = existingBurnEffect.system?.changes || existingBurnEffect.changes || []
                        const existingChange = activeChanges.find((c: any) => c.key === "system.statuses.stacks.burning")
                        const val = existingChange.value

                        let existingDuration = 4
                        if (typeof val === "object" && val !== null) {
                            existingDuration = val.duration || 4
                        }
                        else {
                            existingDuration = JSON.parse(val).duration || 4
                        }

                        if (incomingDuration > existingDuration) {
                            existingBurnEffect.delete()
                            ui.notifications?.info(`Upgraded ${incomingDmgType} burn from ${existingDuration} to ${incomingDuration}!`)
                            effect.updateSource({ statuses: ["burning"] })
                        } else {
                            ui.notifications?.info(`Target already ${vgLiteLang.StatusConditions.burning.name} from ${vgLiteLang.DamageTypes[incomingDmgType]} (${existingDuration}).`)
                            return false
                        }
                    }
                    catch (err) {
                        console.error("VGLite | Error evaluating existing burning instance object mapping:", err)
                    }
                }
                else {
                    effect.updateSource({ statuses: ["burning"] })
                }
            }
        }
    }

}