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
const actor = Array.from(game.actors.entries())[0][1]
const effectData = {
	name: 'Test',
	origin: actor.uuid,
	changes: [
		{ key: 'system.bonus.speed', mode: '2', value: 10, priority: 20 }
	],
	disabled: false
}
await actor.createEmbeddedDocuments('ActiveEffect', [effectData])

*/
export default class VgLiteActiveEffect<
    SubType extends ActiveEffect.SubType = ActiveEffect.SubType
> extends ActiveEffect<SubType> {

    static getActorBonuses = () => {
        return {
            'system.bonus.maxHP': 'Max HP bonus',
            'system.bonus.maxMana': 'Max Mana bonus',
            'system.bonus.maxCast': 'Max mana-per-cast bonus',
            'system.bonus.spellSlots': 'Bonus to number of spell slots',
            'system.bonus.armor': 'Armor bonus',
            'system.bonus.speed': 'Speed bonus',
            'system.bonus.perkSlots': 'Perk slot bonus',
            'system.bonus.inventorySlots': 'Inventory slot bonus',

            'system.bonus.might': 'Might bonus',
            'system.bonus.dexterity': 'Dexterity bonus',
            'system.bonus.awareness': 'Awareness bonus',
            'system.bonus.reason': 'Reason bonus',
            'system.bonus.presence': 'Presence bonus',
            'system.bonus.luck': 'Luck bonus',

            'system.bonus.reflex': 'Reflex bonus',
            'system.bonus.endure': 'Endure bonus',
            'system.bonus.will': 'Will bonus',
            'system.bonus.brawl': 'Brawl bonus',
            'system.bonus.finesse': 'Finesse bonus',
            'system.bonus.melee': 'Melee bonus',
            'system.bonus.ranged': 'Ranged bonus',
            'system.bonus.arcana': 'Arcana bonus',
            'system.bonus.craft': 'Craft bonus',
            'system.bonus.detect': 'Detect bonus',
            'system.bonus.influence': 'Influence bonus',
            'system.bonus.leadership': 'Leadership bonus',
            'system.bonus.medicine': 'Medicine bonus',
            'system.bonus.mysticism': 'Mysticism bonus',
            'system.bonus.performance': 'Performance bonus',
            'system.bonus.sneak': 'Sneak bonus',
            'system.bonus.survival': 'Survival bonus',

            'system.bonus.flatAtkDmg': 'A flat bonus to Attack damage',
            'system.bonus.flatSpellDmg': 'A flat bonus to Spell damage',
            'system.bonus.flatDmgReduction': 'A flat reduction in total damage taken',
            'system.bonus.perDieAtkDmg': 'A per-damage die bonus to Attack damage',
            'system.bonus.perDieSpellDmg': 'A per-damage die bonus to Spell damage',
            'system.bonus.perDieDmgReduction': 'A per-damage die reduction in total damage taken'
        }
    }

    static getItemBonuses = () => {
        return {
            'system.bonus.slots': 'Item slot adjustment',
            'system.bonus.armor': 'Armor rating bonus',
            'system.bonus.flatAtkDmg': 'Flat Attack damage bonus',
            'system.bonus.flatSpellDmg': 'Flat Spell damage bonus'
        }
    }

}

export enum ActiveEffectMode {
    CUSTOM = 0,
    MULTIPLY = 1,
    ADD = 2,
    DOWNGRADE = 3,
    UPGRADE = 4,
    OVERRIDE = 5
}