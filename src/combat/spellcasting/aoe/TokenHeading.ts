/** Remembers which way each token last travelled, so Cones can point along the movement however rotation is configured. */
export class TokenHeading {

  private static readonly headings = new Map<string, number>()

  /** The token's last travel direction as a Foundry rotation (0 = south), or undefined if it hasn't moved. */
  static of(tokenId: string | undefined): number | undefined {
    return tokenId ? TokenHeading.headings.get(tokenId) : undefined
  }

  /** Must be registered before any hook that redraws Cones, so the heading is current by then. */
  static registerHooks() {
    Hooks.on("canvasReady", () => TokenHeading.headings.clear())
    Hooks.on("deleteToken", (doc: any) => TokenHeading.headings.delete(doc.id))
    // Foundry reports the movement's own origin and destination, which is more reliable than diffing positions.
    Hooks.on("moveToken" as any, (doc: any, movement: any) => {
      const from = movement?.origin
      const to = movement?.destination
      if (!from || !to) return
      const dx = to.x - from.x
      const dy = to.y - from.y
      if (!dx && !dy) return
      TokenHeading.headings.set(
        doc.id,
        (Math.atan2(dy, dx) * 180) / Math.PI - 90,
      )
    })
    Hooks.on("updateToken", (doc: any, changed: any) => {
      // A deliberate turn without moving overrides the old heading.
      if (
        "rotation" in changed &&
        !("x" in changed || "y" in changed || "movement" in changed)
      )
        TokenHeading.headings.delete(doc.id)
    })
  }

}
