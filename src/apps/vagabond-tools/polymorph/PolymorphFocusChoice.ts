const HOOK = "vagabondPolymorphFocus"

/**
 * Carries the Focus choice of a cast Polymorph spell over to the Polymorph tool, which may not be open yet.
 * A choice made before the tool mounts is held until the tool takes it.
 */
export class PolymorphFocusChoice {

  private static readonly pending = new Map<string, boolean>()

  /** Records the choice and tells a Polymorph tool that is already open. */
  static set(actorId: string | null | undefined, focused: boolean) {
    if (!actorId) return
    PolymorphFocusChoice.pending.set(actorId, focused)
    ;(Hooks as any).callAll(HOOK, actorId, focused)
  }

  /** The choice made since the tool last took one, if any. */
  static take(actorId: string | null | undefined): boolean | undefined {
    if (!actorId) return undefined
    const focused = PolymorphFocusChoice.pending.get(actorId)
    PolymorphFocusChoice.pending.delete(actorId)
    return focused
  }

  /** Calls back whenever a choice is made for the actor. Returns what to call to stop listening. */
  static onChange(
    actorId: string | null | undefined,
    listener: (focused: boolean) => void,
  ) {
    const id = (Hooks as any).on(
      HOOK,
      (changedId: string, focused: boolean) => {
        if (changedId !== actorId) return
        PolymorphFocusChoice.take(actorId)
        listener(focused)
      },
    )
    return () => (Hooks as any).off(HOOK, id)
  }

}
