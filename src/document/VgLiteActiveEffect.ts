/**
 * Systemic bonuses:
 *      Name: should match the accessor-operator path.
 *      Description: User-friendly description.
 */
export default class VgLiteActiveEffect extends ActiveEffect {
    static getAttributeChoices = () => {
        return {
            'system.health.bonus': 'Max HP bonus',
            'system.health.mana.max': 'Max Mana bonus',
            'system.inventory.slotBonus': 'Inventory slot bonus',
            'system.armor.bonus': 'Armor bonus',
            'system.speed.bonus': 'Speed bonus'
        }
    }
}