/**
 * 
 */
export class VgLiteCombat<SubType extends Combat.SubType = Combat.SubType> extends Combat<SubType> {
    protected override async _preCreate(...[data, options, user]: Parameters<Combat["_preCreate"]>): Promise<boolean | void> {
        return super._preCreate(data, options, user)
    }

    protected override _sortCombatants(a: VgLiteCombatant, b: VgLiteCombatant): number {
        return super._sortCombatants(a, b)
    }
}


/**
 * Vagabond combatant
 */
export class VgLiteCombatant<SubType extends Combatant.SubType = Combatant.SubType> extends Combatant<SubType> {

    override prepareBaseData(): void {
        super.prepareBaseData()
    }
}