import { VgLiteCombatantInstance } from "../model/combat/VgLiteCombatant"

/**
 * 
 */
export class VgLiteCombat<SubType extends Combat.SubType = Combat.SubType> extends Combat<SubType> {
    protected override async _preCreate(...[data, options, user]: Parameters<Combat["_preCreate"]>): Promise<boolean | void> {
        await super._preCreate(data, options, user)
        if (!this.getVgLiteFlag("groupActivations")) {
            (this as any).updateSource({
                "flags.vglite.groupActivations": {}
            })
        }
    }

    protected override _sortCombatants(a: VgLiteCombatant, b: VgLiteCombatant): number {
        return super._sortCombatants(a, b)
    }

    getVgLiteFlag(flagName) {
        return this.getFlag("vagabond-lite" as any, flagName)
    }

    setVgLiteFlag(flagName, flagValue) {
        return this.setFlag("vagabond-lite" as any, flagName, flagValue)
    }

    override async nextTurn(): Promise<this> {
        const combatant = this.combatant
        if (!combatant) {
            return super.nextTurn()
        }

        const { combatGroup, activations } = combatant.system as VgLiteCombatantInstance
        if (combatGroup) {
            await this.setVgLiteFlag(`groupActivations.${this.round}.${combatGroup}`, true)
        }

        return super.nextTurn()
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