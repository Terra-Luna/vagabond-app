import type { Point } from "../AreaTypes"

/** Base for tools that listen to the canvas element and translate mouse events into world coordinates. */
export abstract class CanvasPreview {

  protected readonly view: HTMLElement | undefined
  protected frame = 0

  constructor() {
    const app = (canvas as any)?.app
    this.view = app?.view ?? app?.canvas
  }

  abstract start(): void

  abstract stop(): void

  protected toWorld(event: MouseEvent): Point | undefined {
    const stage = (canvas as any)?.stage
    const view = this.view
    if (!stage || !view) return undefined
    const rect = view.getBoundingClientRect()
    return stage.worldTransform.applyInverse({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  /** Redraws on the next animation frame, dropping any redraw still waiting. */
  protected schedule(draw: () => void) {
    cancelAnimationFrame(this.frame)
    this.frame = requestAnimationFrame(draw)
  }

}
