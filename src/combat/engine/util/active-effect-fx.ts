import { sys_id } from "../../../util/foundry-util"
import type { AppliedFx } from "../Attack"

const AE_FX_PREFIX = "ae:"
const SOURCE_FLAG = "appliedActiveEffectSource"

export const toActiveEffectFxId = (uuid: string) => `${AE_FX_PREFIX}${uuid}`
export const isActiveEffectFx = (id?: string): id is string =>
  !!id && id.startsWith(AE_FX_PREFIX)
const sourceUuid = (id: string) => id.slice(AE_FX_PREFIX.length)

export type LightFxType = "basic" | "sunlight" | "moonlight"
export const LIGHT_FX_TYPES: readonly LightFxType[] = [
  "basic",
  "sunlight",
  "moonlight",
]

const LIGHT_FX_PREFIX = "light:"

/** A light's range is a whole, non-negative number of grid units. */
export const normalizeLightRange = (value: unknown): number => {
  const n = Math.floor(Number(value))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export type LightFx = {
  type: LightFxType
  range: number
  burns: string[]
  damageType: string
  burnDamage: string
}

/**
 * Makes a target emit light. Encoded as "light:" followed by a JSON payload so it travels with the other applied effects as a plain string.
 * `burns` lists the being types that Burn (in `damageType`) while in the light.
 */
export const toLightFxId = (
  type: LightFxType,
  range: number,
  burns: string[] = [],
  damageType = "",
  burnDamage = "",
) =>
  `${LIGHT_FX_PREFIX}${JSON.stringify({ type, range, burns, damageType, burnDamage })}`

export const isLightFx = (id?: string): id is string =>
  !!id && id.startsWith(LIGHT_FX_PREFIX)

/** Reads the older "light:<type>:<range>:<burns>:<damageType>:<burnDamage>" encoding still found in saved Focus records and countdowns. */
const parseLegacyLightFx = (body: string): Partial<LightFx> => {
  const [type, range, burns, damageType, burnDamage] = body.split(":")
  return {
    type: type as LightFxType,
    range: Number(range),
    burns: burns ? burns.split(",") : [],
    damageType,
    burnDamage,
  }
}

const readLightPayload = (body: string): Partial<LightFx> => {
  if (!body.startsWith("{")) return parseLegacyLightFx(body)
  try {
    return JSON.parse(body)
  }
  catch {
    return {}
  }
}

export const parseLightFx = (id: string): LightFx => {
  const raw = readLightPayload(id.slice(LIGHT_FX_PREFIX.length))
  return {
    type: LIGHT_FX_TYPES.includes(raw.type as LightFxType)
      ? (raw.type as LightFxType)
      : "basic",
    range: normalizeLightRange(raw.range),
    burns: Array.isArray(raw.burns) ? raw.burns.filter(Boolean) : [],
    damageType: raw.damageType ?? "",
    burnDamage: raw.burnDamage ?? "",
  }
}

export type EmitsLight = {
  enabled?: boolean
  type?: string
  range?: number
  duration?: string
  burns?: string[]
  burnDamage?: string
}

/**
 * Normalizes the action's applied effects, active effects and emitted light into a single array of AppliedFx.
 */
export const collectAppliedFx = (action: {
  appliedEffects?: unknown
  appliedActiveEffects?: { uuid: string; duration?: string }[]
  emitsLight?: EmitsLight
  damageType?: string
}): AppliedFx[] => [
  ...((action.appliedEffects ?? []) as AppliedFx[]),
  ...(action.appliedActiveEffects ?? []).map((ae) => ({
    effect: toActiveEffectFxId(ae.uuid),
    duration: ae.duration,
  })),
  ...(action.emitsLight?.enabled
    ? [
        {
          effect: toLightFxId(
            action.emitsLight.type as LightFxType,
            action.emitsLight.range || 30,
            [...(action.emitsLight.burns ?? [])],
            action.damageType,
            action.emitsLight.burnDamage,
          ),
          duration: action.emitsLight.duration,
        },
      ]
    : []),
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
