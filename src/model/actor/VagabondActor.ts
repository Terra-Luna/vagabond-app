import { sys_id } from "../../utils/foundryUtils"
import { portraitFrameFlag } from "../../view/sheets/actor/component/PortraitFrame"

const defaultArtworkByType = {
    adversary: `systems/${sys_id}/assets/icons/ic_adversary.webp`,
    itemActor: `/icons/containers/bags/coinpouch-simple-leather-silver-brown.webp`
}

export class VagabondActor<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {

    static override getDefaultArtwork(actorData: any): { img: string, texture: { src: string } } {
        const img = defaultArtworkByType[actorData.type as Actor.SubType] ?? (super.getDefaultArtwork(actorData) as any).img
        return { img, texture: { src: img } }
    }

    protected override async _preUpdate(changes: any, options: any, user: any): Promise<boolean | void> {
        const result = await super._preUpdate(changes, options, user)
        if (result === false) return false

        const imgChanged = changes.img !== undefined && changes.img !== this.img
        const isAddingFrameFlag = foundry.utils.hasProperty(changes, `flags.${sys_id}.${portraitFrameFlag}`)
        const isRemovingFrameFlag = foundry.utils.hasProperty(changes, `flags.${sys_id}.-=${portraitFrameFlag}`)
        const isFrameUpdate = isAddingFrameFlag || isRemovingFrameFlag

        if (imgChanged && !isFrameUpdate && this.getFlag(sys_id, portraitFrameFlag) !== undefined) {
            foundry.utils.setProperty(changes, `flags.${sys_id}.-=${portraitFrameFlag}`, null)
        }
    }

    protected override _onUpdate(changed: any, options: any, userId: string): void {
        super._onUpdate(changed, options, userId)

        /**
         * Listen for name changes on tokens and update the combat tracker.
         */
        if (game.user?.isActiveGM && changed.name && this.isToken && this.token) {
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