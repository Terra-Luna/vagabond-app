import type { RollSummary } from "./RollSummary"

export interface CountdownResult {
    actorUuid?: string
    tokenUuid?: string
    name: string
    duration: number
    damageType?: string
    status?: string
    statusName?: string
    rollSummary?: RollSummary
    rolls?: any[]
    message?: string | null
}