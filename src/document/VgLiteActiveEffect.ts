/**
 * Systemic bonuses:
 *      Name: should match the accessor-operator path.
 *      Description: User-friendly description.
 */
export default class VgLiteActiveEffect extends ActiveEffect {
    static getAttributeChoices = () => {
        return {
            'system.health.bonus': 'Max HP bonus',
            'system.health.current': 'Current HP',
            'system.inventory.maxSlots': 'Max inventory slots',
            'system.inventory.slotBonus': 'Inventory slot bonus'
        }
    }
}