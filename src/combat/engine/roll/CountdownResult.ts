import { RollSummary } from "./RollSummary"

export interface CountdownResult {
    name: string
    duration: number
    rollSummary?: RollSummary
    rolls?: any[]
    message?: string | null
}