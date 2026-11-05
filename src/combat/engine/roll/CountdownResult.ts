import type { RollSummary } from "./RollSummary"

export interface CountdownResult {
  actorUuid?: string
  tokenUuid?: string
  name: string
  duration: number
  damageType?: string
  /** The Focus maintaining this countdown (Burning only), so dropping that Focus clears only its own. */
  focusId?: string
  status?: string
  statusName?: string
  rollSummary?: RollSummary
  rolls?: any[]
  message?: string | null
}
