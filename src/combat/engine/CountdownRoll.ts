import { buildRollSummary, getDiceTerms, RollSummary } from "./util/dice-utils"

export interface CountdownResult {
    name: string
    duration: string
    rollSummary?: RollSummary
    rolls?: any[]
    message?: string | null
}

export class CountdownRoll {

    countdown: CountdownResult

    constructor(countdown: CountdownResult) {
        this.countdown = countdown
    }

    public async roll() {
        const formula = this.countdown.duration
        if (formula.length === 0) return null
        // Transform 'cd6' or 'd6' into a Foundry-friendly countdown roll.
        const foundryRoll = formula.replace(/^c?d(\d+)/i, "1d$1cd")
        const countdown = await new Roll(foundryRoll).evaluate()
        const nextDuration = this.adjustCountdownDuration(countdown.total, foundryRoll.toUpperCase())
        this.countdown = {
            name: this.countdown.name,
            duration: nextDuration,
            rollSummary: buildRollSummary(getDiceTerms(countdown), null, [])[0],
            rolls: [countdown],
            message: nextDuration === '' ?
                'Countdown has expired' : (
                    foundryRoll != nextDuration ?
                        `Countdown has reduced to: ${nextDuration.replace(/^1[dD](\d+)[cC][dD]$/, "Cd$1")}...` :
                        `Countdown continues...`
                )
        }
        return this.countdown
    }

    /**
     * Expected forumla formatting: 1D6CD.
     * @param result
     * @param formula 
     * @returns 
     */
    private adjustCountdownDuration(result: number, formula: string): string {
        if (result > 1) {
            return formula
        }
        else if (formula === '1D4CD') {
            // Countdown has expired by rolling a 1 on a d4.
            return ''
        }
        else {
            // Countdown has reduced die size. E.g.: Converts CD6 to CD4.
            const reducedRoll = formula.replace(/([dD])(\d+)/, (match: string, letter: string, faces: string): string => {
                return letter + (parseInt(faces) - 2)
            })
            return reducedRoll
        }
    }

}