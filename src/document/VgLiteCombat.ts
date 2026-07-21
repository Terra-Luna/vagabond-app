import { COMBAT_GROUPS, CombatGroup, VgLiteCombatantInstance } from "../model/combat/VgLiteCombatant"

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

    callAllHooks(name, updateData, updateOptions = {}) {
        Hooks.callAll(name, this, updateData, updateOptions)
    }


    /**
     * Set all combatants to their max activations
     */
    async resetActivations(): Promise<any> {
        await this.deactivateAllGroups()
        const skipDefeated = this.settings.skipDefeated;
        const updates = this.combatants.map(c => {
            console.log(c)
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

    getVgLiteFlag(flagName) {
        return this.getFlag("vagabond-lite" as any, flagName)
    }

    setVgLiteFlag(flagName, flagValue) {
        return this.setFlag("vagabond-lite" as any, flagName, flagValue)
    }

    activateGroup(groupName: CombatGroup) {
        // deactivate all other groups
        const groupNamesToDeactivate = COMBAT_GROUPS.filter(gn => gn !== groupName)
        return Promise.all([
            this.setVgLiteFlag(`groupActivations.${this.round}.${groupName}`, true),
            ...groupNamesToDeactivate.map(gn => this.setVgLiteFlag(`groupActivations.${this.round}.${gn}`, false))
        ])
    }

    deactivateGroup(groupName: CombatGroup) {
        return this.setVgLiteFlag(`groupActivations.${this.round}.${groupName}`, false)
    }

    deactivateAllGroups() {
        return Promise.all(COMBAT_GROUPS.map(gn => this.setVgLiteFlag(`groupActivations.${this.round}.${gn}`, false)))
    }

    isGroupActive(groupName: CombatGroup) {
        return this.getVgLiteFlag(`groupActivations.${this.round}.${groupName}`)
    }

    async activateCombatant(id: string) {
        const combatant = this.getEmbeddedDocument("Combatant", id, {}) as VgLiteCombatant
        if (!combatant?.activations.value) return this

        await combatant.activate()
        // if the user activated a combatant whose group wasn't active (like the right click menu), activate their group (subject to change)
        if (!this.isGroupActive(combatant.groupName)) {
            await this.activateGroup(combatant.groupName)
        }
        const turn = this.turns.findIndex(t => t.id === id) // the index of the turn where the combatant ID matches the one given to us
        const updateData = { turn }
        const updateOptions = { direction: 1 as const } // not sure if we need this yet

        this.callAllHooks("combatTurn", updateData, updateOptions)
        return this.update(updateData, updateOptions)
    }

    deactivateCombatant(id: string) {
        const turn = this.turns.findIndex(t => t.id === id);
        if (turn !== this.turn) return this;
        return this.nextTurn()
    }

    override async nextTurn(): Promise<this> {
        const updateData = { turn: null };
        const updateOptions = { advanceTime: 0, direction: 0 };
        this.callAllHooks("combatTurn", updateData, updateOptions);
        await this.update(updateData, updateOptions as any);
        return this;
    }

    override async nextRound(): Promise<this> {
        await this.resetActivations();
        const updateData = { round: this.round + 1, turn: null };
        const updateOptions = { direction: 1 }; // note - we're not doing advanceTime here, we may want to? Lancer does
        this.callAllHooks("combatRound", updateData, updateOptions);
        await this.update(updateData, updateOptions as any);
        return this;
    }


    override async previousRound(): Promise<this> {
        await this.resetActivations();
        const round = Math.max(this.round - 1, 0);
        const updateData = { round, turn: null };
        const updateOptions = { direction: -1 };
        this.callAllHooks("combatRound", updateData, updateOptions);
        await this.update(updateData, updateOptions as any);
        return this;
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

    activate() {
        return this.update({ system: { activations: { value: Math.max((this.activations.value ?? 0) - 1, 0) } } })
    }
}