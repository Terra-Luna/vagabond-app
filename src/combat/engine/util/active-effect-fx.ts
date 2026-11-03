import { sys_id } from "../../../util/foundry-util"
import type { AppliedFx } from "../Attack"

const AE_FX_PREFIX = "ae:"
const SOURCE_FLAG = "appliedActiveEffectSource"

export const toActiveEffectFxId = (uuid: string) => `${AE_FX_PREFIX}${uuid}`
export const isActiveEffectFx = (id?: string): id is string =>
  !!id && id.startsWith(AE_FX_PREFIX)
const sourceUuid = (id: string) => id.slice(AE_FX_PREFIX.length)

/**
 * Normalizes the action's applied effects and active effects into a single array of AppliedFx.
 */
export const collectAppliedFx = (action: {
  appliedEffects?: unknown
  appliedActiveEffects?: { uuid: string; duration?: string }[]
}): AppliedFx[] => [
  ...((action.appliedEffects ?? []) as AppliedFx[]),
  ...(action.appliedActiveEffects ?? []).map((ae) => ({
    effect: toActiveEffectFxId(ae.uuid),
    duration: ae.duration,
  })),
]

const findCopies = (actor: any, id: string): any[] =>
  (actor.effects?.contents ?? []).filter(
    (e: any) => e.getFlag?.(sys_id, SOURCE_FLAG) === id,
  )

/**
 * Copies the Active Effect onto the actor. Returns the effect's name, or undefined if it can't be resolved.
 */
export const applyActiveEffectCopy = async (
  actor: any,
  id: string,
): Promise<string | undefined> => {
  const source = (await fromUuid(sourceUuid(id) as any)) as any
  if (!source) {
    ui.notifications?.warn(`Applied Active Effect not found: ${sourceUuid(id)}`)
    return undefined
  }

  if (game.user?.isGM && findCopies(actor, id).length === 0) {
    try {
      const data = source.toObject()
      delete data._id
      data.disabled = false
      data.transfer = false
      data.origin = source.uuid
      data.flags = {
        ...data.flags,
        [sys_id]: { ...(data.flags?.[sys_id] ?? {}), [SOURCE_FLAG]: id },
      }
      await actor.createEmbeddedDocuments("ActiveEffect", [data])
    }
    catch (error) {
      console.error("Failed to apply Active Effect", error)
      ui.notifications?.error(`Failed to apply ${source.name} to ${actor.name}`)
    }
  }
  return source.name
}

export const removeActiveEffectCopy = async (actor: any, id: string) => {
  if (!game.user?.isGM) return
  const ids = findCopies(actor, id).map((e) => e.id)
  if (ids.length) await actor.deleteEmbeddedDocuments("ActiveEffect", ids)
}
