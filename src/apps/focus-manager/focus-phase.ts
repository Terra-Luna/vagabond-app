export type FocusPhase = "upkeep" | "rescue" | "damage" | "done"

/** Which step of the per-round Focus flow a Focus is at. Progress lives on the Focus itself so it survives closing the app. */
export const resolveFocusPhase = ({
  isDue,
  needsUpkeep,
  paidKey,
  failedKey,
  roundKey,
}: {
  isDue: boolean
  needsUpkeep: boolean
  paidKey?: string
  failedKey?: string
  roundKey: string
}): FocusPhase => {
  if (!isDue) return "done"
  if (paidKey === roundKey || !needsUpkeep) return "damage"
  if (failedKey === roundKey) return "rescue"
  return "upkeep"
}
