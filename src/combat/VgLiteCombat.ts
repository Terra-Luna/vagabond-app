/**
 * 
 */
export class VgLiteCombat<SubType extends Combat.SubType = Combat.SubType> extends Combat<SubType> {
    
    protected override async _preCreate(...[data, options, user]: Parameters<Combat["_preCreate"]>): Promise<boolean | void> {
        this.updateSource({ turn: null })
        return super._preCreate(data, options, user)
    }

    protected override _sortCombatants(a: VgLiteCombatant, b: VgLiteCombatant): number {
        const dc = b.disposition - a.disposition
        if (dc !== 0) {
            return dc
        }
        else {
            return super._sortCombatants(a, b)
        }
    }

    override async startCombat(): Promise<this> {
        this._playCombatSound("startEncounter")
        //return super.startCombat()
        const data = { round: 1, turn: 0 } // todo terra is this ok?
        Hooks.callAll("combatStart", this as any, data)
        await this.resetActivations()
        await this.update(data)
        return this
    }

    async resetActivations(): Promise<VgLiteCombatant[]> {
        const updates = this.combatants.map(c => {
            return {
                _id: c.id,
                "system.activations": {
                    value: c.isDefeated ? 0 : 1,
                    max: 1
                }
            }
        })
        return await this.updateEmbeddedDocuments("Combatant", updates) as any
    }

    override async resetAll(): Promise<this> {
        await this.resetActivations()
        this.combatants.forEach(c => c.updateSource({ initiative: null }))
        await this.update({ turn: null, combatants: this.combatants.toObject() }, { diff: false })
        return this
    }

    override async nextTurn(): Promise<this> {
        const data = { turn: 0, round: 0 }
        const options = { advanceTime: 0, direction: 0 }
        Hooks.callAll("combatTurn", this, data, options)
        await this.update(data, options as any)
        return this
    }

    override async previousTurn(): Promise<this> {
        if (this.turn === null) {
            return this
        }
        else {
            const data = { turn: 0, round: 0 }
            const options = { advanceTime: -CONFIG.time.turnTime, direction: -1 }
            Hooks.callAll("combatTurn", this, data, options)
            await this.update(data, options as any)
            return this
        }
    }

    override async nextRound(): Promise<this> {
        await this.resetActivations()
        const data = { round: this.round + 1, turn: null }
        let advanceTime = Math.max(this.turns.length - (this.turn || 0), 0) * CONFIG.time.turnTime
        advanceTime += CONFIG.time.roundTime
        const options = { advanceTime, direction: 1 }
        Hooks.callAll("combatRound", this, data, options)
        await this.update(data, options as any)
        return this
    }

    override async previousRound(): Promise<this> {
        await this.resetActivations()
        const round = Math.max(this.round - 1, 0)
        const advanceTime = 0 // the commented out line below doesn't do anything, but if it starts to, this needs to be let
        if (round > 0) {
            //advanceTime -= CONFIG.time.roundTime
        }
        else {
            const data = { round, turn: null }
            const options = { advanceTime, direction: -1 }
            Hooks.callAll("combatRound", this, data, options)
            await this.update(data, options as any)
        }
        return this
    }

    /**
     * Call this to activate the given combatant in the turn tracker.
     */
    async activateCombatant(id: string, override = false): Promise<this | undefined> {
        if (!(game.user?.isGM || (this.turn == null && this.combatants.get(id)?.isOwner) || override)) {
            return this.requestActivation(id)
        }
        else {
            const combatant = this.getEmbeddedDocument("Combatant", id, {})
            if ((!combatant?.system as any).activations.value) {
                return this
            }
            else {
                await (combatant as any)?.modifyCurrentActivations(-1)
                const turn = this.turns.findIndex(i => i.id === id)
                const data = { turn, round: 0 }
                const options = { advanceTime: CONFIG.time.turnTime, direction: 1 as const }
                Hooks.callAll("combatTurn", this, data, options)
                return this.update(data, options)
            }
        }
    }

    async deactivateCombatant(id: string) {
        const turn = this.turns.findIndex(i => i.id === id)
        if (turn !== this.turn || !this.turns[turn].testUserPermission(game.user!, "OWNER") && !game.user?.isGM) {
            return this
        }
        else {
            return this.nextTurn()
        }
    }

    protected async requestActivation(id: string): Promise<this> {
        //Hooks.callAll("VgLiteCombatRequestActivate", this, id) commented out for removing squigglies
        return this
    }

    /**
     * Kill the next-up sound fx since players determine order.
     */
    override _playCombatSound(...[announcement]: Parameters<Combat["_playCombatSound"]>) {
        if (announcement === "nextUp") return
        return super._playCombatSound(announcement)
    }

}

/**
 * Vagabond combatant
 */
export class VgLiteCombatant<SubType extends Combatant.SubType = Combatant.SubType> extends Combatant<SubType> {
    
    override prepareBaseData(): void {
        super.prepareBaseData()
        this.initiative ??= 0
    }

    get disposition(): number {
        const disposition = <number>this.token?.disposition ?? this.actor?.prototypeToken.disposition ?? -2
        if (disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY && this.hasPlayerOwner) {
            return 2
        }
        else {
            return disposition
        }
    }

    get activations(): Activations {
        return (this.system as any).activations
    }

    async addActivations(acts: number): Promise<this | undefined> {
        if (acts === 0) {
            return this
        }
        else {
            return (this as any).update({
                'system.activations': {
                    max: Math.max((this.activations.max ?? 1) + acts, 1),
                    value: Math.max((this.activations.value ?? 0) + acts, 0)
                }
            })
        }
    }

    async modifyCurrentActivations(acts: number): Promise<this | undefined> {
        if (acts === 0) {
            return this
        }
        else {
            return (this as any).update({
                'system.activations': {
                    value: Math.clamp((this.activations?.value ?? 0) + acts, 0, this.activations?.max ?? 1)
                }
            })
        }
    }
}

/**
 * Wrap the combatant in an interface to provide activations prop.
 */
interface Activations { max?: number, value?: number }
declare module "fvtt-types/configuration" {
    interface FlagConfig {
        Combatant: {
            'vagabond-lite': {
                activations: Activations
            }
        }
    }
}