import { VagabondActiveEffect } from "../../combat/documents/VagabondActiveEffect"
import { showFloatingText, sys_id } from "../../utils/foundryUtils"
import { portraitFrameFlag } from "../../view/sheets/actor/component/PortraitFrame"
import { PolymorphUtil } from "./util/PolymorphUtil"

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

        const sys = this.system as any
        options.vagabondPrevValues = {
            hp: sys?.health?.value,
            fatigue: sys?.statuses?.counters?.fatigue,
            mana: sys?.mana?.value
        }
    }

    /**
     * When an Actor is updated, every client shows floating numbers over its tokens
     * for HP, fatigue and mana changes.
     */
    private showFloatingChanges(changed: any, options: any) {
        if (!canvas?.ready) return
        const prev = options?.vagabondPrevValues

        const newHp = foundry.utils.getProperty(changed, "system.health.value")
        if (typeof newHp === "number" && typeof prev?.hp === "number") {
            const maxHp = (this.system as any)?.health?.max
            
            const effectiveHp = typeof maxHp === "number" && maxHp > 0 && newHp > prev.hp
                ? Math.max(prev.hp, Math.min(newHp, maxHp))
                : newHp
            
            const diff = effectiveHp - prev.hp
            if (diff !== 0) showFloatingText(this, Math.abs(diff), { isHealing: diff > 0 })
        }

        const newFatigue = foundry.utils.getProperty(changed, "system.statuses.counters.fatigue")
        if (typeof newFatigue === "number" && typeof prev?.fatigue === "number" && newFatigue !== prev.fatigue) {
            const diff = newFatigue - prev.fatigue
            const fatigueColor = getComputedStyle(document.body).getPropertyValue("--color-ic-fatigue").trim() || "#733e0a"
            const text = diff > 0 ? `+${diff}` : `-${Math.abs(diff)}`
            showFloatingText(this, text, { isHealing: diff > 0, color: fatigueColor })
        }

        const newMana = foundry.utils.getProperty(changed, "system.mana.value")
        if (typeof newMana === "number" && typeof prev?.mana === "number" && newMana !== prev.mana) {
            const diff = newMana - prev.mana
            const manaColor = getComputedStyle(document.body).getPropertyValue("--color-mana").trim() || "#155dfc"
            showFloatingText(this, Math.abs(diff), { isHealing: diff > 0, color: manaColor })
        }
    }

    protected override _onUpdate(changed: any, options: any, userId: string): void {
        super._onUpdate(changed, options, userId)
        this.showFloatingChanges(changed, options)

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

    protected override _onDeleteDescendantDocuments(...args: Actor.OnDeleteDescendantDocumentsArgs): void {
        super._onDeleteDescendantDocuments(...args)

        const [, collection, , ids] = args as unknown as [unknown, string, unknown, string[]]
        const focusingEffectId = VagabondActiveEffect.statusEffects.find(it => it.id === "focusing")?._id
        if (collection === "effects" && focusingEffectId && ids.includes(focusingEffectId)) {
            PolymorphUtil.releaseAllPolymorphsOnce(this)
        }
    }

}