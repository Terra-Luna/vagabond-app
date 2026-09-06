import { ActiveEffectDataModel } from "../../model/effect/ActiveEffectDataModel"
import { EquipmentDataModel } from "../../model/item/equip/EquipmentDataModel"

/**
 * The static effects' names and descriptions can be displayed to a GM user when configuring
 * active effects for Classes, Ancestries, Equipment, etc... On-save, the path property can 
 * be used to apply the effect via #addActiveEffect(), below.
 */
export class VagabondActiveEffect<SubType extends ActiveEffect.SubType = ActiveEffect.SubType> extends ActiveEffect<SubType> {

    static statusEffects = [
        {
            _id: "vBerserk00000000",
            id: "berserk",
            name: "APP.StatusConditions.berserk.name",
            img: "icons/svg/explosion.svg",
            changes: [{ key: "system.statuses.toggles.berserk", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vBlinded00000000",
            id: "blinded",
            name: "APP.StatusConditions.blinded.name",
            img: "icons/svg/blind.svg",
            changes: [
                { key: "system.statuses.toggles.blinded", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vBurning00000000",
            id: "burning",
            name: "APP.StatusConditions.burning.name",
            img: "icons/svg/fire.svg",
            changes: [{ key: "system.statuses.toggles.burning", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vCharmed00000000",
            id: "charmed",
            name: "APP.StatusConditions.charmed.name",
            img: "icons/svg/heal.svg",
            changes: [{ key: "system.statuses.toggles.charmed", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vConfused0000000",
            id: "confused",
            name: "APP.StatusConditions.confused.name",
            img: "icons/svg/stoned.svg",
            changes: [{ key: "system.statuses.toggles.confused", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vDazed0000000000",
            id: "dazed",
            name: "APP.StatusConditions.dazed.name",
            img: "icons/svg/daze.svg",
            changes: [{ key: "system.statuses.toggles.dazed", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vFatigued0000000",
            id: "fatigued",
            name: "APP.StatusConditions.fatigued.name",
            img: "/icons/svg/unconscious.svg",
            changes: [{ key: "system.counters.statuses.fatigue", mode: "ADD", value: "1" }]
        },
        {
            _id: "vFrightened00000",
            id: "frightened",
            name: "APP.StatusConditions.frightened.name",
            img: "icons/svg/terror.svg",
            changes: [
                { key: "system.statuses.toggles.frightened", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.damage.out.all", mode: "ADD", value: "-2" }
            ]
        },
        {
            _id: "vGrappling000000",
            id: "grappling",
            name: "APP.StatusConditions.grappling.name",
            img: "/icons/svg/bones.svg",
            changes: [
                { key: "system.statuses.toggles.grappling", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vIncapacitated00",
            id: "incapacitated",
            name: "APP.StatusConditions.incapacitated.name",
            img: "icons/svg/falling.svg",
            changes: [
                { key: "system.statuses.toggles.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vInvisible000000",
            id: "invisible",
            name: "APP.StatusConditions.invisible.name",
            img: "icons/svg/invisible.svg",
            changes: [{ key: "system.statuses.toggles.invisible", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vParalyzed000000",
            id: "paralyzed",
            name: "APP.StatusConditions.paralyzed.name",
            img: "/icons/svg/ice-aura.svg",
            changes: [
                { key: "system.statuses.toggles.paralyzed", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.speed.turn", mode: "OVERRIDE", value: "0" }
            ]
        },
        {
            _id: "vProne0000000000",
            id: "prone",
            name: "APP.StatusConditions.prone.name",
            img: "/icons/svg/falling.svg",
            changes: [{ key: "system.statuses.toggles.prone", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vRestrained00000",
            id: "restrained",
            name: "APP.StatusConditions.restrained.name",
            img: "icons/svg/net.svg",
            changes: [
                { key: "system.statuses.toggles.restrained", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" },
                { key: "system.speed.turn", mode: "OVERRIDE", value: "0" }
            ]
        },
        {
            _id: "vSickened0000000",
            id: "sickened",
            name: "APP.StatusConditions.sickened.name",
            img: "/icons/svg/degen.svg",
            changes: [
                { key: "system.statuses.toggles.sickened", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.healing.in", mode: "ADD", value: "-2" }
            ]
        },
        {
            _id: "vSuffocating0000",
            id: "suffocating",
            name: "APP.StatusConditions.suffocating.name",
            img: "/icons/svg/acid.svg",
            changes: [{ key: "system.statuses.toggles.suffocating", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vUnconscious0000",
            id: "unconscious",
            name: "APP.StatusConditions.unconscious.name",
            img: "/icons/svg/sleep.svg",
            changes: [
                { key: "system.statuses.toggles.unconscious", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.blinded", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.toggles.prone", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vVulnerable00000",
            id: "vulnerable",
            name: "APP.StatusConditions.vulnerable.name",
            img: "/icons/svg/dice-target.svg",
            changes: [{ key: "system.statuses.toggles.vulnerable", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vDead00000000000",
            id: "dead",
            name: "APP.StatusConditions.dead.name",
            img: "icons/svg/skull.svg",
            changes: [{ key: "system.statuses.toggles.dead", mode: "OVERRIDE", value: "true" }]
        },

        /**
         * Special effects from Hero abilities...
         */
        {
            _id: "vWarded000000000",
            id: "warded",
            name: "APP.StatusConditions.warded.name",
            img: "/icons/svg/mage-shield.svg",
            changes: [
                { key: "system.statuses.toggles.warded", mode: "OVERRIDE", value: "true" },
                { key: "system.armor.rating", mode: "ADD", value: "1" }
            ]
        },
        {
            _id: "vExalted00000000",
            id: "exalted",
            name: "APP.StatusConditions.exalted.name",
            img: "/icons/svg/paralysis.svg",
            changes: [
                { key: "system.statuses.toggles.exalted", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.damage.out.melee.perDieBonus", mode: "ADD", value: "1" },
                { key: "system.modifiers.damage.out.brawl.perDieBonus", mode: "ADD", value: "1" },
                { key: "system.modifiers.damage.out.finesse.perDieBonus", mode: "ADD", value: "1" },
                { key: "system.modifiers.damage.out.ranged.perDieBonus", mode: "ADD", value: "1" },
                { key: "system.modifiers.damage.out.thrown.perDieBonus", mode: "ADD", value: "1" },
                { key: "system.modifiers.damage.out.defense.perDieBonus", mode: "ADD", value: "1" },
                { key: "system.modifiers.damage.out.spell.perDieBonus", mode: "ADD", value: "1" }
            ]
        },
        {
            _id: "vBlessed00000000",
            id: "blessed",
            name: "APP.StatusConditions.blessed.name",
            img: "/icons/svg/angel.svg",
            changes: [
                { key: "system.statuses.toggles.blessed", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.skillCheck.reflex.d4", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.skillCheck.endure.d4", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.skillCheck.will.d4", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vMarked000000000",
            id: "marked",
            name: "APP.StatusConditions.marked.name",
            img: "/icons/svg/target.svg",
            changes: [{ key: "system.statuses.toggles.marked", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vHexed0000000000",
            id: "hexed",
            name: "APP.StatusConditions.hexed.name",
            img: "/icons/svg/cancel.svg",
            changes: [{ key: "system.statuses.toggles.hexed", mode: "OVERRIDE", value: "true" }]
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

}