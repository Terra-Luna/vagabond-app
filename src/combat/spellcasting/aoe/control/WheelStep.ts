/** Turns mouse wheel notches into stepped sizes: up on scroll-up, down on scroll-down, never below the minimum. */
export class WheelStep {

  constructor(
    private readonly step: number,
    private readonly min: number,
  ) {}

  next(current: number, wheelDelta: number) {
    return Math.max(
      this.min,
      current + (wheelDelta < 0 ? this.step : -this.step),
    )
  }

  /** The next size when it differs from `current`, otherwise undefined. */
  change(current: number, event: WheelEvent) {
    const next = this.next(current, event.deltaY || event.deltaX)
    return next === current ? undefined : next
  }

}
