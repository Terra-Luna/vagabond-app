export class VagabondActor<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {

    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments()
        const system = this.system as any
        
        /**
         * This collects all the Actor's Burn effects and compiles them
         * into their ...system.statuses.stacks.burning array.
         */
        system.statuses.stacks.burning = []
        const activeBurns = this.effects.filter(
            (e: any) => !e.disabled && e.name.includes("burning.name")
        )

        activeBurns.forEach((effect: any) => {
            const stackChange = effect.changes.find(
                (c: any) => c.key === "system.statuses.stacks.burning"
            )

            if (stackChange) {
                try {
                    const parsedData = JSON.parse(stackChange.value)
                    system.statuses.stacks.burning.push({
                        effectId: effect.id || "",
                        duration: parsedData.duration || 4,
                        sourceUuid: parsedData.sourceUuid || effect.origin || ""
                    })
                }
                catch (err) {
                    console.warn("Failed to parse burning stack data for effect", effect, err)
                    system.statuses.stacks.burning.push({
                        effectId: effect.id || "",
                        duration: 4,
                        sourceUuid: effect.origin || ""
                    })
                }
            }
        })
    }

    protected override _onUpdate(changed: any, options: any, userId: string): void {
        super._onUpdate(changed, options, userId)

        /**
         * Listen for name changes on tokens and update the combat tracker.
         */
        if (changed.name && this.isToken && this.token) {
            this.token.update({ name: changed.name }).then(() => {
                const activeCombat = game.combat
                if (!activeCombat) return

                const matchingCombatant = activeCombat.combatants.contents.find((c: any) => {
                    return c.tokenId === this.token?.id
                })

                if (matchingCombatant) {
                    matchingCombatant.update({ name: changed.name }).then(() => {
                        ui.combat?.render(true)
                    })
                }
            })
        }
    }

}