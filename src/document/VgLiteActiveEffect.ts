/**
Systemic bonuses:
    Name: should match the accessor-operator path.
    Description: User-friendly description to help users set up Active Effects.
    
Documentation: https://foundryvtt.com/article/active-effects/

//List Actor paths:
const types = Actor.implementation.TYPES;
const shells = types.map( t => new Actor.implementation({name: t, type: t}));
shells.forEach( s => console.log(`'${s.type}'`, 'type Actors have the following attribute keys available:\nsystem.\n', s.toObject().system));
 
//List Item paths:
const types = Item.implementation.TYPES;
const shells = types.map( t => new Item.implementation({name: t, type: t}));
shells.forEach( s => console.log(`'${s.type}'`, 'type Items have the following attribute keys available:\nsystem.\n', s.toObject().system));

//Create an ActiveEffect
const doc = game.items.getName("Backpack")
const effectData = {
	name: 'Backpack',
	origin: doc.uuid,
	changes: [
		{ key: 'system.inventory.capacity', mode: '2', value: 2, priority: 20 }
	],
	disabled: false,
    transfer: true
}
await doc.createEmbeddedDocuments('ActiveEffect', [effectData])

*/

/**
 * The static effects' names and descriptions can be displayed to a GM user when configuring
 * active effects for Classes, Ancestries, Equipment, etc... On-save, the path property can 
 * be used to apply the effect via #addActiveEffect(), below.
 */
export class VgLiteActiveEffect<SubType extends ActiveEffect.SubType = ActiveEffect.SubType> extends ActiveEffect<SubType> {

    static effects = [
        {
            id: "berserk",
            name: "VGLITE.StatusBerserk",
            img: "systems/vglite/icons/conditions/berserk.svg",
            changes: [
                { key: "system.statuses.berserk", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "blinded",
            name: "VGLITE.StatusBlinded",
            img: "systems/vglite/icons/conditions/blinded.svg",
            changes: [
                { key: "system.statuses.blinded", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.statuses.vulnerable", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "burning",
            name: "VGLITE.StatusBurning",
            img: "systems/vglite/icons/conditions/burning.svg",
            changes: [
                { key: "system.statuses.burning", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "charmed",
            name: "VGLITE.StatusCharmed",
            img: "systems/vglite/icons/conditions/charmed.svg",
            changes: [
                { key: "system.statuses.charmed", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "confused",
            name: "VGLITE.StatusConfused",
            img: "systems/vglite/icons/conditions/confused.svg",
            changes: [
                { key: "system.statuses.confused", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "dazed",
            name: "VGLITE.StatusDazed",
            img: "systems/vglite/icons/conditions/dazed.svg",
            changes: [
                { key: "system.statuses.dazed", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "fatigued",
            name: "VGLITE.StatusFatigued",
            img: "systems/vglite/icons/conditions/fatigued.svg",
            changes: [
                { key: "system.counters.fatigue", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1" }
            ]
        },
        {
            id: "frightened",
            name: "VGLITE.StatusFrightened",
            img: "systems/vglite/icons/conditions/frightened.svg",
            changes: [
                { key: "system.statuses.frightened", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.modifiers.damage.all", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2" }
            ]
        },
        {
            id: "incapacitated",
            name: "VGLITE.StatusIncapacitated",
            img: "systems/vglite/icons/conditions/incapacitated.svg",
            changes: [
                { key: "system.statuses.incapacitated", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.statuses.vulnerable", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "invisible",
            name: "VGLITE.StatusInvisible",
            img: "systems/vglite/icons/conditions/invisible.svg",
            changes: [
                { key: "system.statuses.invisible", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "paralyzed",
            name: "VGLITE.StatusParalyzed",
            img: "systems/vglite/icons/conditions/paralyzed.svg",
            changes: [
                { key: "system.statuses.paralyzed", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.statuses.incapacitated", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.attributes.speed.value", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "0" }
            ]
        },
        {
            id: "prone",
            name: "VGLITE.StatusProne",
            img: "systems/vglite/icons/conditions/prone.svg",
            changes: [
                { key: "system.statuses.prone", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "restrained",
            name: "VGLITE.StatusRestrained",
            img: "systems/vglite/icons/conditions/restrained.svg",
            changes: [
                { key: "system.statuses.restrained", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.statuses.vulnerable", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.attributes.speed.value", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "0" }
            ]
        },
        {
            id: "sickened",
            name: "VGLITE.StatusSickened",
            img: "systems/vglite/icons/conditions/sickened.svg",
            changes: [
                { key: "system.statuses.sickened", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.modifiers.healingReceived", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2" }
            ]
        },
        {
            id: "suffocating",
            name: "VGLITE.StatusSuffocating",
            img: "systems/vglite/icons/conditions/suffocating.svg",
            changes: [
                { key: "system.statuses.suffocating", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "unconscious",
            name: "VGLITE.StatusUnconscious",
            img: "systems/vglite/icons/conditions/unconscious.svg",
            changes: [
                { key: "system.statuses.unconscious", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.statuses.blinded", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.statuses.incapacitated", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" },
                { key: "system.statuses.prone", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        },
        {
            id: "vulnerable",
            name: "VGLITE.StatusVulnerable",
            img: "systems/vglite/icons/conditions/vulnerable.svg",
            changes: [
                { key: "system.statuses.vulnerable", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" }
            ]
        }
    ]

}

/**
 * These numerical values are provided by Foundry, translated
 * here to make development easier and code more readable.
 */
export enum ActiveEffectMode {
    CUSTOM = 0,
    MULTIPLY = 1,
    ADD = 2,
    DOWNGRADE = 3,
    UPGRADE = 4,
    OVERRIDE = 5
}

export interface VgLiteEffect {
    name: string
    description: string
    path: string
}

/**
 * Helper function for adding an Active Effect to the given document.
 * @param document 
 * @param effect 
 * @param value 
 * @param mode 
 */
export const addActiveEffect = (document: any, effect: VgLiteEffect, value: string, mode: ActiveEffectMode) => {
    const fx = {
        name: effect.name,
        icon: 'icons/svg/aura.svg',
        changes: [{ key: effect.path, value: value, mode: mode }]
    }
    try {
        document.createEmbeddedDocuments('ActiveEffect', [fx])
    }
    catch (e) {
        document.parent.createEmbeddedDocuments('ActiveEffect', [fx])
    }
}