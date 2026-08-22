import { createElement } from "react"

import { sendVagabondChatMessage } from "../../../view/chat/ChatCardSerializer"
import { CountdownRollChatCard } from "../../../view/chat/CountdownChatCard"
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
            rollSummary: { ...RollSummary.buildRollSummaries(getDiceTerms(roll), null, [])[0] },
            rolls: [roll],
            message: nextDuration === 0
                ? 'Countdown has expired'
                : (
                    roll.total === 1
                        ? `Countdown has reduced to: Cd${nextDuration}...`
                        : `Countdown continues...`
                )
        }

        sendVagabondChatMessage(
            null,
            createElement(CountdownRollChatCard, { result: this.result }),
            [roll]
        )

        return this.result
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
                : (this.result.duration - 2)
        }
    }

}