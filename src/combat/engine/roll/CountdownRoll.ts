import { sys_id } from "../../../utils/foundryUtils"
import { sendVagabondChatCard } from "../../../view/chat/ChatCardSerializer"
import { getDiceTerms } from "../util/dice-utils"
import { CountdownResult } from "./CountdownResult"
import { RollSummary } from "./RollSummary"

export class CountdownRoll {

    result: CountdownResult

    constructor(countdown: CountdownResult) {
        this.result = countdown
    }

    public async roll() {
        const formula = `d${this.result.duration}`
        const roll = await new Roll(formula).evaluate()
        const nextDuration = this.adjustCountdownDuration(roll.total)

        this.result = {
            name: this.result.name,
            duration: nextDuration,
            actorUuid: this.result.actorUuid,
            tokenUuid: this.result.tokenUuid,
            damageType: this.result.damageType,
            status: this.result.status,
            rollSummary: { ...RollSummary.buildRollSummaries(getDiceTerms(roll), [], null, [])[0] },
            rolls: [roll],
            message: nextDuration === 0
                ? 'Countdown has expired'
                : (
                    roll.total === 1
                        ? `Countdown has reduced to: Cd${nextDuration}...`
                        : `Countdown continues...`
                )
        }

        if (this.result.status !== "burning") {
            sendVagabondChatCard(
                null,
                "CountdownRollChatCard",
                { result: this.result },
                [roll]
            )
        }

        return this.result
    }

    public async applyBurningDamage() {
        if (this.result.status !== "burning") return

        const token = this.result.tokenUuid
            ? await fromUuid(this.result.tokenUuid) as TokenDocument | null
            : null
        const actor = token?.actor ?? (this.result.actorUuid
            ? await fromUuid(this.result.actorUuid) as Actor | null
            : null)
        if (!actor) {
            console.warn(`${sys_id} | Actor not found: "${this.result.name}"`)
            return
        }

        const damage = this.result.rollSummary?.result ?? 0
        const health = (actor.system as any)?.health?.value ?? 0

        if (this.result.damageType === "mana") {
            if (!(actor.system as any)?.mana) return
            const adjMana = damage + (actor.system as any).mana.value
            await actor.update({ "system.mana.value": adjMana } as Record<string, number>)
        }
        else {
            const adjHp = this.result.damageType === "healing"
                ? health + damage
                : health - damage

            await actor.update({ "system.health.value": adjHp } as Record<string, number>)
        }
    }

    /**
     * Expected forumla formatting: 1D6CD.
     * @param result
     * @param formula 
     * @returns 
     */
    private adjustCountdownDuration(result: number) {
        if (result > 1) {
            return this.result.duration
        }
        else {
            return this.result.duration === 4
                ? 0
                : (this.result.duration === 20
                    ? 12
                    : this.result.duration - 2
                )
        }
    }

}