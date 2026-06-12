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
const doc = game.actors.getName("Orphenia")
const effectData = {
	name: 'Tough',
	origin: doc.uuid,
	changes: [
		{ key: 'system.armor.rating', mode: '2', value: 2, priority: 20 }
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
export default class VgLiteActiveEffect<
    SubType extends ActiveEffect.SubType = ActiveEffect.SubType
> extends ActiveEffect<SubType> {

    static effects: VgLiteEffect[] = [
        {
            name: 'Max HP',
            description: 'Adjust max HP by the given value',
            path: 'system.health.max'
        },
        {
            name: 'Armor',
            description: 'Adjust overall Armor rating',
            path: 'system.armor.rating'
        },
        {
            name: 'Might',
            description: 'Adjust Might stat by the given value',
            path: 'system.stats.might'
        },
        {
            name: 'Dexterity',
            description: 'Adjust Dexterity stat by the given value',
            path: 'system.stats.dexterity'
        },
        {
            name: 'Awareness',
            description: 'Adjust Awareness stat by the given value',
            path: 'system.stats.awareness'
        },
        {
            name: 'Reason',
            description: 'Adjust Reason stat by the given value',
            path: 'system.stats.reason'
        },
        {
            name: 'Presence',
            description: 'Adjust Presence stat by the given value',
            path: 'system.stats.presence'
        },
        {
            name: 'Luck',
            description: 'Adjust Luck stat by the given value',
            path: 'system.stats.luck'
        },
        {
            name: 'Reflex',
            description: 'Reflex save bonus',
            path: 'system.saves.reflex'
        },
        {
            name: 'Endure',
            description: 'Endure save bonus',
            path: 'system.saves.endure'
        },
        {
            name: 'Will',
            description: 'Will save bonus',
            path: 'system.saves.will'
        },
        {
            name: 'Speed',
            description: 'Turn speed bonus',
            path: 'system.speed.turn'
        },
        {
            name: 'Max Mana',
            description: 'Adjust max Mana',
            path: 'system.mana.max'
        },
        {
            name: 'Max Mana per Cast',
            description: 'Adjust max Mana allowed per Cast',
            path: 'system.mana.maxCast'
        },
        {
            name: 'Bound Relic Limit',
            description: 'Adjusts player bound relic limit by the given value',
            path: 'system.boundRelicLimit'
        },
        {
            name: 'Inventory Slots',
            description: 'Adjusts inventory capacity by the given value',
            path: 'system.inventory.capacity'
        },
        /**
         * Damage bonuses...
         */
        {
            name: 'Flat Attack Damage',
            description: 'Applies the given value as a flat bonus to Attack damage',
            path: 'system.bonus.flatAtkDmg'
        },
        {
            name: 'Flat Spell Damage',
            description: 'Applies the given value as a flat bonus to Spell damage',
            path: 'system.bonus.flatSpellDmg'
        },
        {
            name: 'Per-Die Attack Damage',
            description: 'Adjusts Attack damage by the given value per damage die rolled',
            path: 'system.bonus.perDieAtkDmg'
        },
        {
            name: 'Per-Die Spell Damage',
            description: 'Adjusts Spell damage by the given value per damage die rolled',
            path: 'system.bonus.perDieSpellDmg'
        },
        /**
         * Protective bonuses...
         */
        {
            name: 'Flat Attack Damage Mitigation',
            description: 'Reduces incoming Attack damage by the given value',
            path: 'system.bonus.flatAtkDmgMitigation'
        },
        {
            name: 'Flat Spell Damage Mitigation',
            description: 'Reduces incoming Spell damage by the given value',
            path: 'system.bonus.flatSpellDmgMitigation'
        },
        {
            name: 'Per-Die Attack Damage Mitigation',
            description: 'Reduces incoming Attack damage by the given value per damage die rolled',
            path: 'system.bonus.perDieAtkDmgMitigation'
        },
        {
            name: 'Per-Die Spell Damage Mitigation',
            description: 'Reduces incoming Spell damage by the given value per damage die rolled',
            path: 'system.bonus.perDieSpellDmgMitigation'
        },
        {
            name: 'Reflex Save',
            description: 'Bonus to Reflex Save rolls',
            path: 'system.bonus.reflexSave'
        },
        {
            name: 'Endure Save',
            description: 'Bonus to Endure Save rolls',
            path: 'system.bonus.endureSave'
        },
        {
            name: 'Will Save',
            description: 'Bonus to Will Save rolls',
            path: 'system.bonus.willSave'
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
        icon: 'icons/svg/upgrade.svg',
        changes: [{ key: effect.path, value: value, mode: mode }]
    }
    try {
        document.createEmbeddedDocuments('ActiveEffect', [fx])
    }
    catch (e) {
        document.parent.createEmbeddedDocuments('ActiveEffect', [fx])
    }
}