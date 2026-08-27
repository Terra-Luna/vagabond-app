import { RollSummary } from "./RollSummary"

export interface CountdownResult {
    actorId?: string
    tokenUuid?: string
    name: string
    duration: number
    damageType?: string
    status?: string
    rollSummary?: RollSummary
    rolls?: any[]
    message?: string | null
}