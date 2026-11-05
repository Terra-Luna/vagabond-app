/**
 * Remembers which keys were handled during the current round, forgetting them all when the round changes.
 */
export class RoundMemo {

  private roundKey?: string
  private handled = new Set<string>()

  has(roundKey: string, key: string): boolean {
    this.rollOver(roundKey)
    return this.handled.has(key)
  }

  add(roundKey: string, key: string) {
    this.rollOver(roundKey)
    this.handled.add(key)
  }

  private rollOver(roundKey: string) {
    if (roundKey === this.roundKey) return
    this.roundKey = roundKey
    this.handled.clear()
  }

}
