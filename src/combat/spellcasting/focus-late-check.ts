/** Whether a Hostile that just entered the light is new this round: a baseline exists and it wasn't in it. */
export const isNewEntrant = (
  tokenId: string | undefined,
  baselineKey: string | undefined,
  litIds: string[] | undefined,
  key: string,
): boolean =>
  !!tokenId && baselineKey === key && !(litIds ?? []).includes(tokenId)

/** A late check is owed once per round, and only after upkeep was already paid for the round's baseline targets. */
export const owesLateCheck = (state: {
  isNewcomer: boolean
  alreadyPaid: boolean
  lateKey?: string
  key: string
}): boolean =>
  state.isNewcomer && state.alreadyPaid && state.lateKey !== state.key
