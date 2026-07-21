import { CombatGroup, VgLiteCombatantInstance } from "../model/combat/VgLiteCombatant"

/**
 * 
 */
export class VgLiteCombat<SubType extends Combat.SubType = Combat.SubType> extends Combat<SubType> {
    protected override async _preCreate(...[data, options, user]: Parameters<Combat["_preCreate"]>): Promise<boolean | void> {
        // this makes it so their is no "current combatant"
        this.updateSource({ turn: null })

        if (!this.getVgLiteFlag("groupActivations")) {
            (this as any).updateSource({
                "flags.vagabond-lite.groupActivations": {}
            })
        }

        return super._preCreate(data, options, user)
    }

    callAllHooks(name, updateData) {
        Hooks.callAll(name, this, updateData)
    }


    /**
     * Set all combatants to their max activations
     */
    async resetActivations(): Promise<any> {
        const skipDefeated = this.settings.skipDefeated;
        const updates = this.combatants.map(c => {
            return {
                _id: c.id,
                "system.activations.value": skipDefeated && c.isDefeated ? 0 : ((c as VgLiteCombatant).activations.max ?? 0),
            };
        });
        return this.updateEmbeddedDocuments("Combatant", updates);
    }

    override async startCombat(): Promise<this> {
        this._playCombatSound("startEncounter");
        const updateData = { round: 1, turn: null };
        this.callAllHooks("combatStart", updateData);
        await this.resetActivations();
        await this.update(updateData);
        await this.activateGroup("heroes")
        return this;
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

    activateGroup(groupName: CombatGroup) {
        return this.setVgLiteFlag(`groupActivations.${this.round}.${groupName}`, true)
    }

    deactivateGroup(groupName: CombatGroup) {
        return this.setVgLiteFlag(`groupActivations.${this.round}.${groupName}`, false)
    }

    isGroupActive(groupName: CombatGroup) {
        return this.getVgLiteFlag(`groupActivations.${this.round}.${groupName}`)
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
 * Interface for the activations object
 */
interface Activations {
    max?: number;
    value?: number;
}

/**
 * Vagabond combatant
 */
export class VgLiteCombatant<SubType extends Combatant.SubType = Combatant.SubType> extends Combatant<SubType> {
    override prepareBaseData(): void {
        super.prepareBaseData()
    }

    /**
     * The current activation data for the combatant.
     */
    get activations(): Activations {
        return (this.system as any).activations;
    }

    /**
     * The current activation data for the combatant.
     */
    get groupName(): CombatGroup {
        return (this.system as any).combatGroup;
    }
}