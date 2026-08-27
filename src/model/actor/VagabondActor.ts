const defaultArtworkByType = {
    adversary: 'systems/vagabond-lite/assets/icons/ic_adversary.webp'
}

export class VagabondActor<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {

    static override getDefaultArtwork(actorData: any): { img: string, texture: { src: string } } {
        const img = defaultArtworkByType[actorData.type as Actor.SubType] ?? (super.getDefaultArtwork(actorData) as any).img
        return { img, texture: { src: img } }
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