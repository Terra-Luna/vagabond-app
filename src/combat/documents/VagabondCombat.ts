import { CountdownManager } from "../../apps/vagabond-tools/usecase/CountdownManager"
import { StatusEffectUtil } from "../../model/actor/util/StatusEffectUtil"
import { CombatGroup } from "../../model/combat/VagabondCombatant"
import { sys_id } from "../../utils/foundryUtils"

export class VagabondCombat<SubType extends Combat.SubType = Combat.SubType> extends Combat<SubType> {
    protected override async _preCreate(...[data, options, user]: Parameters<Combat["_preCreate"]>): Promise<boolean | void> {
        // this makes it so their is no "current combatant"
        this.updateSource({ turn: null })

        return super._preCreate(data, options, user)
    }

    protected override _onUpdate(changed: any, options: any, userId: string): void {
        super._onUpdate(changed, options, userId)
        if ("round" in changed) this.refreshCombatantActors()
    }

    protected override _onDelete(options: any, userId: string): void {
        super._onDelete(options, userId)
        this.refreshCombatantActors()
    }

    /**
     * Combat modifiers depend on the combat round, so actors must re-derive their data when it changes.
     */
    refreshCombatantActors() {
        for (const c of this.combatants) {
            const actor = c.actor
            if (!actor) continue
            actor.reset()
            actor.render()
        }
    }

    callAllHooks(name, updateData, updateOptions = {}) {
        Hooks.callAll(name, this, updateData, updateOptions)
    }


    /**
     * Set all combatants to their max activations
     */
    async resetActivations(): Promise<any> {
        const skipDefeated = this.settings.skipDefeated
        const updates = this.combatants.map(c => {
            return {
                _id: c.id,
                "system.activations.value": skipDefeated && c.isDefeated ? 0 : ((c as VagabondCombatant).activations.max ?? 0),
            }
        })
        return this.updateEmbeddedDocuments("Combatant", updates)
    }

    override async startCombat(): Promise<this> {
        this._playCombatSound("startEncounter")
        const updateData = { round: 1, turn: null }
        this.callAllHooks("combatStart", updateData)
        await this.resetActivations()
        await this.update(updateData)
        return this
    }

    getVagabondFlag(flagName) {
        return this.getFlag(sys_id, flagName)
    }

    setVagabondFlag(flagName, flagValue) {
        return this.setFlag(sys_id, flagName, flagValue)
    }

    async activateCombatant(id: string) {
        if (!this.started) return this

        const combatant = this.getEmbeddedDocument("Combatant", id, {}) as VagabondCombatant
        if (!combatant?.activations.value) return this

        await combatant.activate()

        const turn = this.turns.findIndex(t => t.id === id) // the index of the turn where the combatant ID matches the one given to us
        const updateData = { turn }
        const updateOptions = { direction: 1 as const } // not sure if we need this yet

        this.callAllHooks("combatTurn", updateData, updateOptions)
        return this.update(updateData, updateOptions)
    }

    deactivateCombatant(id: string) {
        const turn = this.turns.findIndex(t => t.id === id)
        if (turn !== this.turn) return this
        return this.nextTurn()
    }

    override async nextTurn(): Promise<this> {
        const updateData = { turn: null }
        const updateOptions = { advanceTime: 0, direction: 0 }
        this.callAllHooks("combatTurn", updateData, updateOptions)
        await this.update(updateData, updateOptions as any)
        return this
    }

    override async nextRound(): Promise<this> {
        await this.resetActivations()
        const updateData = { round: this.round + 1, turn: null }
        const updateOptions = { direction: 1 } // note - we're not doing advanceTime here, we may want to? Lancer does
        this.callAllHooks("combatRound", updateData, updateOptions)
        await this.update(updateData, updateOptions as any)
        return this
    }

    override async previousRound(): Promise<this> {
        await this.resetActivations()
        const round = Math.max(this.round - 1, 0)
        const updateData = { round, turn: null }
        const updateOptions = { direction: -1 }
        this.callAllHooks("combatRound", updateData, updateOptions)
        await this.update(updateData, updateOptions as any)
        return this
    }
}

/**
 * Interface for the activations object
 */
interface Activations {
    max?: number
    value?: number
}

/**
 * Vagabond combatant
 */
export class VagabondCombatant<T extends Combatant.SubType = "base"> extends Combatant<T> {
    override prepareBaseData(): void {
        super.prepareBaseData()
    }

    /**
     * The current activation data for the combatant.
     */
    get activations(): Activations {
        return (this.system as any).activations
    }

    get combatGroup(): CombatGroup {
        return (this.system as any).combatGroup
    }

    /** NPCs and adversaries use a fixed, non-random initiative: hitDice + threatLevel. */
    override getInitiativeRoll(formula?: string): Roll {
        const actor = this.actor as any
        if (actor?.type === "npc" || actor?.type === "adversary") {
            const hitDice = Number(actor.system?.hitDice ?? 0)
            const threat = Number(actor.system?.threatLevel ?? 0)
            return new Roll(String(hitDice + threat))
        }
        return super.getInitiativeRoll(formula)
    }

    updateBurningStatus() {
        const actor = this.token?.actor
        if (actor) {
            const isBurning = !!CountdownManager.getAll().find(countdown =>
                countdown.result.actorUuid === actor.uuid &&
                countdown.result.status === "burning" &&
                (countdown.result.tokenUuid ? countdown.result.tokenUuid === this.token?.uuid : true)
            )
            const currentBurning =
                actor.statuses?.has?.("burning") ||
                (actor.system as any)?.statuses?.toggles?.burning ||
                actor.effects?.some((e: any) => e.statuses?.has?.("burning") || e._id === "vBurning00000000")

            if (isBurning !== currentBurning) {
                StatusEffectUtil.toggleStatusEffectOnce(actor, "burning", isBurning)
            }
        }
    }

    activate() {
        return this.update({ system: { activations: { value: Math.max((this.activations.value ?? 0) - 1, 0) } } })
    }

    resetActivations() {
        return this.update({ system: { activations: { value: this.activations.max } } })
    }
}