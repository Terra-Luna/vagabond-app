import { roll3dDice } from "../../utils/foundryUtils"
import { RollSummary } from "./RollSummary"
import { getDiceTerms } from "./util/dice-utils"

export interface CountdownResult {
    name: string
    duration: number
    rollSummary?: RollSummary
    rolls?: any[]
    message?: string | null
}

export class CountdownRoll {

    result: CountdownResult

    constructor(countdown: CountdownResult) {
        this.result = countdown
    }

    public async roll() {
        // Transform 'cd6' or 'd6' into a Foundry-friendly countdown roll.
        const foundryRoll = `d${this.result.duration}`

        const roll = await new Roll(foundryRoll).evaluate()
        roll3dDice([roll])

        const nextDuration = this.adjustCountdownDuration(roll.total)
        this.result = {
            name: this.result.name,
            duration: nextDuration,
            rollSummary: RollSummary.buildRollSummaries(getDiceTerms(roll), null, [])[0],
            rolls: [roll],
            message: nextDuration === 0
                ? 'Countdown has expired'
                : (
                    roll.total === nextDuration
                        ? `Countdown continues...`
                        : `Countdown has reduced to: Cd${nextDuration}...`
                )
        }
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