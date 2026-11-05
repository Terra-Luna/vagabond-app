/** Identifies one combat round (or the no-combat state) for tracking upkeep progress. */
export const roundKey = (round: number): string =>
  `${game.combat?.id ?? "none"}:${round}`

/** The key of the current combat round (or the no-combat state). */
export const currentRoundKey = (): string => {
  const combat = game.combat as any
  return roundKey(combat?.started ? combat.round : 0)
}
