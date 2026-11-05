/** Whether a Burning countdown belongs to the Focus: tagged with it, or untagged (saved before tagging). */
export const isOwnedByFocus = (
  countdown: { focusId?: string },
  focusId?: string,
): boolean => !countdown.focusId || countdown.focusId === focusId
