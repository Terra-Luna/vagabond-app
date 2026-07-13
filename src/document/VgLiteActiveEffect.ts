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

    static effects = []

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