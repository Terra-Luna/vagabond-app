import { FlaskRound, Lightbulb, LightbulbOff } from "lucide-react"

import { showConfirmationDialog } from "../apps/vagabond-tools/dialog/ConfirmationDialogUseCase"
import { CountdownManager } from "../apps/vagabond-tools/usecase/CountdownManager"
import { getRealtimeLightsources } from "../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { isImmuneToBurning } from "../combat/engine/util/burning-mitigation"
import { isImmuneToStatus } from "../combat/engine/util/damage-mitigation"
import { StatusEffectUtil } from "../model/actor/util/StatusEffectUtil"
import type { CtxMenuItem } from "../view/component/ContextMenu"
import { sys_id } from "./foundry-util"
import { appLang } from "./lang"
import { localizeString } from "./locale-util"

type LightData = {
  isLightSource?: boolean
  isLit?: boolean
  range: number
  color: string
  duration: number
  remaining: number
  litTS: number
  requiresFuel?: boolean
  isFueled?: boolean
  expendable?: boolean
  isDark?: boolean
  isSunlight?: boolean
  isMoonlight?: boolean
}

type LightKindFlags = Pick<LightData, "isDark" | "isSunlight" | "isMoonlight">

/** Sunlight/moonlight designations that grant an in-light effect to tokens in range. */
type LightKind = "sunlight" | "moonlight"
type LightType = "none" | LightKind

type Point = { x: number; y: number }

type Emitter = {
  id: unknown
  center: Point
  range: number
  type: LightKind
  ignoresWalls: boolean
}

const LIGHT_TYPES: readonly LightKind[] = ["sunlight", "moonlight"]

/** A status applied while in a light, as configured by an "ApplyStatus" rule. */
type AppliedEffect = {
  mode: "status" | "activeEffect"
  status: string
  damageType: string
  die: number
  uuid: string
}

export class LightSourceUtil {

  private static readonly LIGHT_FLAG = "lightSourceItemId"
  private static readonly TYPE_FLAG = "lightType"
  private static readonly EFFECT_FLAG = "lightEffect"
  private static readonly APPLIED_FLAG = "appliedKeys"
  private static readonly RULE_FX_FLAG = "ruleEffect"
  private static readonly NO_LIGHT = { dim: 0, bright: 0 }
  /* This value helps with odd dead-angles caused by calculating true distance on a grid system */
  private static readonly RANGE_TOLERANCE = 1
  private static readonly EFFECT_UUIDS: Record<LightKind, string> = {
    sunlight:
      "Compendium.vagabond-app.active-effects.ActiveEffect.40CQqoU8bdlmKUu5",
    moonlight:
      "Compendium.vagabond-app.active-effects.ActiveEffect.NnDOEKfLfYN5OJKq",
  }

  private static tickerId?: ReturnType<typeof setInterval>
  private static effectCache: Partial<Record<LightKind, any>> = {}
  private static syncTimer?: ReturnType<typeof setTimeout>
  private static syncRunning = false
  private static syncQueued = false

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  private static typeFlagPath(): string {
    return `flags.${sys_id}.${LightSourceUtil.TYPE_FLAG}`
  }

  private static hasRadius(light?: { dim?: number; bright?: number }): boolean {
    return (light?.dim ?? 0) > 0 || (light?.bright ?? 0) > 0
  }

  private static sceneTokens(): any[] {
    return ((canvas as any).tokens?.placeables ?? []) as any[]
  }

  /** Sunlight/moonlight designation stored as a flag next to a native light config. */
  private static readLightType(doc: any): LightKind | undefined {
    const type = doc.getFlag(sys_id, LightSourceUtil.TYPE_FLAG)
    return LIGHT_TYPES.includes(type) ? type : undefined
  }

  // ---------------------------------------------------------------------------
  // Burn state, fuel and timers (item data)
  // ---------------------------------------------------------------------------

  static remainingSeconds(data: LightData, now: number = Date.now()): number {
    if (data.requiresFuel && !data.isFueled) return 0
    const stored = data.remaining < 0 ? data.duration : data.remaining
    const burned = data.litTS > 0 ? (now - data.litTS) / 1000 : 0
    return Math.max(0, Math.floor(stored - burned))
  }

  static isInfinite(data: LightData | undefined): boolean {
    return !!data?.isLightSource && !data.expendable && !data.requiresFuel
  }

  /* Don't shed light unless bound. */
  static isUnbound(system: any): boolean {
    return !!system?.isBoundRelic?.() && !system.isBound
  }

  static hasFuel(data: LightData): boolean {
    if (LightSourceUtil.isInfinite(data)) return true
    if (data.requiresFuel && !data.isFueled) return false
    return (
      !getRealtimeLightsources() || LightSourceUtil.remainingSeconds(data) > 0
    )
  }

  static showsTimer(data: LightData | undefined): boolean {
    return (
      !!data?.isLightSource &&
      !LightSourceUtil.isInfinite(data) &&
      getRealtimeLightsources()
    )
  }

  static applyBurnState(current: LightData | undefined, changes: any) {
    const sys = changes.system
    if (!current?.isLightSource) return
    const requested = sys?.lightSourceData?.isLit
    const forcedOff = sys?.isEquipped === false || sys?.isBound === false
    if (!forcedOff && requested === undefined) return

    const remaining = LightSourceUtil.remainingSeconds(current)
    const isLit = forcedOff
      ? false
      : requested && LightSourceUtil.hasFuel(current)
    if (!!isLit === !!current.isLit) return

    const light = (sys.lightSourceData ??= {})
    light.isLit = !!isLit
    if (!getRealtimeLightsources() || LightSourceUtil.isInfinite(current))
      return
    light.remaining = remaining
    light.litTS = isLit && !game.paused ? Date.now() : 0
  }

  static resetTimer(changes: any, duration: number, isLit: boolean) {
    const light = (changes.system.lightSourceData ??= {})
    light.remaining = duration
    light.litTS =
      isLit && duration > 0 && getRealtimeLightsources() && !game.paused
        ? Date.now()
        : 0
  }

  private static async expireSpentSources() {
    if (!game.user?.isActiveGM || !getRealtimeLightsources()) return

    const paused = !!game.paused
    const actors = new Set<any>(game.actors?.contents ?? [])
    for (const scene of game.scenes?.contents ?? []) {
      for (const token of scene.tokens as any) {
        if (!token.actorLink && token.actor) actors.add(token.actor)
      }
    }

    for (const actor of actors) {
      for (const item of actor.items as any) {
        const data = item.system?.lightSourceData
        if (!data?.isLightSource || LightSourceUtil.isInfinite(data)) continue

        if (paused && data.litTS > 0) {
          await item.update({
            "system.lightSourceData": {
              remaining: LightSourceUtil.remainingSeconds(data),
              litTS: 0,
            },
          })
          continue
        }
        if (
          !paused &&
          data.isLit &&
          !(data.litTS > 0) &&
          !(data.requiresFuel && !data.isFueled)
        ) {
          await item.update({ "system.lightSourceData.litTS": Date.now() })
          continue
        }
        if (!(data.litTS > 0)) continue
        if (LightSourceUtil.remainingSeconds(data) > 0) continue
        const pileToken =
          actor.isToken &&
          (actor.token?.getFlag?.("item-piles", "data") as any)?.enabled
            ? actor.token
            : undefined
        if (
          pileToken &&
          data.expendable &&
          !data.requiresFuel &&
          actor.items.size === 1
        ) {
          await pileToken.delete()
          break
        }
        if (data.expendable && !data.requiresFuel) {
          await item.delete()
          continue
        }
        await item.update({
          "system.lightSourceData": {
            isLit: false,
            remaining: 0,
            litTS: 0,
            ...(data.requiresFuel && { isFueled: false }),
          },
        })
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Native light configuration (item -> actor / token light)
  // ---------------------------------------------------------------------------

  private static buildLight(
    data: LightKindFlags & Pick<LightData, "range" | "color">,
  ) {
    const isPlain = !data.isSunlight && !data.isMoonlight && !data.isDark
    if (data.isMoonlight && !data.isDark) {
      return {
        dim: data.range,
        bright: 0,
        angle: 360,
        color: data.color,
        alpha: 0.8,
        priority: 0,
        negative: false,
        coloration: 1,
        luminosity: 0,
        attenuation: 1,
        animation: { type: "ghost", speed: 1, intensity: 2, reverse: false },
      }
    }
    if (data.isSunlight && !data.isDark) {
      return {
        dim: data.range,
        bright: 0,
        angle: 360,
        color: data.color,
        alpha: 0.4,
        priority: 0,
        negative: false,
        coloration: 1,
        luminosity: 0.5,
        attenuation: 1,
        animation: {
          type: "starlight",
          speed: 1,
          intensity: 1,
          reverse: false,
        },
      }
    }
    return {
      dim: data.range,
      bright: isPlain ? Math.min(5, data.range) : 0,
      angle: 360,
      color: data.color,
      alpha: isPlain ? 0.5 : 0.4,
      priority: 0,
      negative: !!data.isDark,
      coloration: 1,
      luminosity: 0.5,
      attenuation: 0.5,
      animation: {
        type: "torch",
        speed: isPlain ? 4 : 2,
        intensity: 5,
        reverse: false,
      },
    }
  }

  static lightType(data: LightKindFlags): LightType {
    if (data.isDark) return "none"
    if (data.isSunlight) return "sunlight"
    return data.isMoonlight ? "moonlight" : "none"
  }

  /** Token update payload (native light + type flag) for a lit item, or for no light at all. */
  private static tokenLightUpdate(best: any | undefined) {
    const data = best?.system?.lightSourceData
    return {
      light: data ? LightSourceUtil.buildLight(data) : LightSourceUtil.NO_LIGHT,
      [LightSourceUtil.typeFlagPath()]: data
        ? LightSourceUtil.lightType(data)
        : "none",
    }
  }

  /** If multiple light sources are active, return the one with the longest range. */
  private static bestSource(actor: any): any | undefined {
    const sources = (actor?.items?.filter((it: any) => {
      const data = it.system?.lightSourceData
      return (
        data?.isLightSource &&
        data.isLit &&
        LightSourceUtil.hasFuel(data) &&
        !LightSourceUtil.isUnbound(it.system)
      )
    }) ?? []) as any[]
    return sources.sort(
      (a, b) => b.system.lightSourceData.range - a.system.lightSourceData.range,
    )[0]
  }

  static async syncActorLight(actor: any) {
    if (!actor || actor.type === "container") return

    const best = LightSourceUtil.bestSource(actor)
    const previous = actor.getFlag(sys_id, LightSourceUtil.LIGHT_FLAG)

    if (!best && !previous) return

    const { light, ...flags } = LightSourceUtil.tokenLightUpdate(best)
    const tokens = (actor.getActiveTokens?.(false, true) ?? []) as any[]

    await Promise.all([
      actor.update({
        "prototypeToken.light": light,
        ...Object.fromEntries(
          Object.entries(flags).map(([path, value]) => [
            `prototypeToken.${path}`,
            value,
          ]),
        ),
        [best
          ? `flags.${sys_id}.${LightSourceUtil.LIGHT_FLAG}`
          : `flags.${sys_id}.-=${LightSourceUtil.LIGHT_FLAG}`]: best
          ? best.id
          : null,
      }),
      ...tokens.map((token) => token.update({ light, ...flags })),
    ])
  }

  static async syncAllActors() {
    if (!game.user?.isActiveGM) return
    await Promise.all(
      (game.actors?.contents ?? []).map((actor) =>
        LightSourceUtil.syncActorLight(actor),
      ),
    )
  }

  // ---------------------------------------------------------------------------
  // Light geometry: which tokens are within reach of a sun/moon emitter
  // ---------------------------------------------------------------------------

  private static centerOf(token: any): Point {
    const doc = token.document
    const size = (canvas as any).grid.size
    return {
      x: doc.x + (doc.width * size) / 2,
      y: doc.y + (doc.height * size) / 2,
    }
  }

  /** True straight-line distance in scene units, ignoring the grid's measurement rules. */
  private static distanceBetween(a: Point, b: Point): number {
    const grid = (canvas as any).grid
    return (Math.hypot(a.x - b.x, a.y - b.y) / grid.size) * grid.distance
  }

  private static isBlocked(a: Point, b: Point): boolean {
    return !!(CONFIG as any).Canvas.polygonBackends.light.testCollision(a, b, {
      type: "light",
      mode: "any",
    })
  }

  private static tokenEmitters(): Emitter[] {
    return LightSourceUtil.sceneTokens().flatMap((token) => {
      const light = token.document.light
      const type = LightSourceUtil.readLightType(token.document)
      if (!type || light?.negative || !LightSourceUtil.hasRadius(light))
        return []
      return [
        {
          id: token,
          center: LightSourceUtil.centerOf(token),
          range: Math.max(light.dim, light.bright),
          type,
          ignoresWalls: false,
        },
      ]
    })
  }

  private static ambientEmitters(): Emitter[] {
    const lights = ((canvas as any).lighting?.placeables ?? []) as any[]
    return lights.flatMap((light) => {
      const doc = light.document
      const cfg = doc.config
      const type = LightSourceUtil.readLightType(doc)
      if (
        !type ||
        doc.hidden ||
        cfg?.negative ||
        !LightSourceUtil.hasRadius(cfg)
      )
        return []
      return [
        {
          id: light,
          center: { x: doc.x, y: doc.y },
          range: Math.max(cfg.dim, cfg.bright),
          type,
          ignoresWalls: doc.walls === false,
        },
      ]
    })
  }

  private static reaches(target: any, source: Emitter): boolean {
    if (target === source.id) return true
    const center = LightSourceUtil.centerOf(target)
    return (
      LightSourceUtil.distanceBetween(source.center, center) <=
        source.range + LightSourceUtil.RANGE_TOLERANCE &&
      (source.ignoresWalls || !LightSourceUtil.isBlocked(source.center, center))
    )
  }

  /** Token movement is staged in Foundry; wait for it to finish before measuring. */
  private static async settleAnimations(tokens: any[]) {
    const pending = () =>
      tokens.map((t) => t.movementAnimationPromise).filter(Boolean)
    const moving = () =>
      tokens.some((t) => t.document?.movement?.state === "pending")
    // Waiting can chain into new animations (multi-step moves), so loop, but never hang on a stalled animation.
    const deadline = Date.now() + 5000
    for (
      let list = pending();
      (list.length || moving()) && Date.now() < deadline;
      list = pending()
    )
      await Promise.race([
        Promise.allSettled(list),
        new Promise((resolve) => setTimeout(resolve, deadline - Date.now())),
      ]).then(() => new Promise((resolve) => setTimeout(resolve, 50)))
  }

  // ---------------------------------------------------------------------------
  // In-light active effects on actors
  // ---------------------------------------------------------------------------

  private static async loadEffects() {
    for (const type of LIGHT_TYPES) {
      if (LightSourceUtil.effectCache[type]) continue
      const effect = await fromUuid(LightSourceUtil.EFFECT_UUIDS[type] as any)
      if (effect) LightSourceUtil.effectCache[type] = effect.toObject()
    }
  }

  private static effectData(type: LightKind) {
    const data = foundry.utils.deepClone(LightSourceUtil.effectCache[type])
    delete data._id
    delete data.folder
    delete data._stats
    data.flags = { [sys_id]: { [LightSourceUtil.EFFECT_FLAG]: type } }
    return data
  }

  private static managedEffects(actor: any, type: LightKind): any[] {
    return actor.effects.filter(
      (e: any) => e.getFlag(sys_id, LightSourceUtil.EFFECT_FLAG) === type,
    )
  }

  /** Clears `active` values written directly to the actor by earlier versions. */
  private static staleModifierClear(actor: any): Record<string, boolean> {
    const stored = actor._source?.system?.modifiers?.misc?.light
    return Object.fromEntries(
      LIGHT_TYPES.filter((type) => stored?.[type]?.active).map((type) => [
        `system.modifiers.misc.light.${type}.active`,
        false,
      ]),
    )
  }

  /** Adds, removes or de-duplicates the managed effects so they match `wanted`. */
  private static reconcileEffects(
    actor: any,
    wanted: Record<LightKind, boolean>,
  ): Promise<unknown> {
    const updates: Promise<unknown>[] = []
    const stale = LightSourceUtil.staleModifierClear(actor)
    if (Object.keys(stale).length) updates.push(actor.update(stale))

    const toCreate: any[] = []
    const toDelete: string[] = []
    for (const type of LIGHT_TYPES) {
      const existing = LightSourceUtil.managedEffects(actor, type)
      if (!wanted[type]) toDelete.push(...existing.map((e) => e.id))
      else if (existing.length === 0)
        toCreate.push(LightSourceUtil.effectData(type))
      else toDelete.push(...existing.slice(1).map((e) => e.id))
    }
    if (toCreate.length)
      updates.push(actor.createEmbeddedDocuments("ActiveEffect", toCreate))
    if (toDelete.length)
      updates.push(actor.deleteEmbeddedDocuments("ActiveEffect", toDelete))
    return Promise.all(updates)
  }

  /**
   * Applies what the actor's "ApplyStatus" rules call for: unconditional entries always,
   * light-conditional ones while the token is in that light. Anything no longer wanted is lifted.
   */
  private static async reconcileApplied(
    token: any,
    wanted: Record<LightKind, boolean>,
  ) {
    const actor = token.actor
    const misc = actor.system?.modifiers?.misc
    const active = new Map<string, AppliedEffect>()
    const add = (effects?: AppliedEffect[]) =>
      (effects ?? []).forEach((e) =>
        active.set(LightSourceUtil.appliedKey(e), e),
      )
    add(misc?.applied)
    for (const kind of LIGHT_TYPES)
      if (wanted[kind]) add(misc?.light?.[kind]?.effects)
    if (!wanted.sunlight && !wanted.moonlight) add(misc?.light?.basic?.effects)

    const previous: string[] =
      actor.getFlag(sys_id, LightSourceUtil.APPLIED_FLAG) ?? []
    for (const key of previous)
      if (!active.has(key)) await LightSourceUtil.liftApplied(token, key)

    for (const effect of active.values()) {
      if (effect.mode === "activeEffect")
        await LightSourceUtil.applyActiveEffect(actor, effect)
      else await LightSourceUtil.applyStatus(token, effect)
    }

    const current = [...active.keys()]
    if (JSON.stringify(previous) === JSON.stringify(current)) return
    if (current.length)
      await actor.setFlag(sys_id, LightSourceUtil.APPLIED_FLAG, current)
    else await actor.unsetFlag(sys_id, LightSourceUtil.APPLIED_FLAG)
  }

  private static appliedKey(effect: AppliedEffect): string {
    return effect.mode === "activeEffect"
      ? `effect:${effect.uuid}`
      : `status:${effect.status}:${effect.damageType}`
  }

  private static async liftApplied(token: any, key: string) {
    const actor = token.actor
    const [kind, ...rest] = key.split(":")
    if (kind === "effect") {
      const ids = actor.effects
        .filter(
          (e: any) =>
            e.getFlag(sys_id, LightSourceUtil.RULE_FX_FLAG) === rest.join(":"),
        )
        .map((e: any) => e.id)
      if (ids.length) await actor.deleteEmbeddedDocuments("ActiveEffect", ids)
      return
    }
    const [status, damageType] = rest
    await CountdownManager.removeStatus(
      actor.uuid,
      token.document.uuid,
      status,
      damageType,
    )
    StatusEffectUtil.toggleStatusEffectOnce(actor, status, false)
  }

  private static async applyActiveEffect(actor: any, effect: AppliedEffect) {
    const exists = actor.effects.some(
      (e: any) =>
        e.getFlag(sys_id, LightSourceUtil.RULE_FX_FLAG) === effect.uuid,
    )
    if (exists) return
    const source = (await fromUuid(effect.uuid as any)) as any
    if (!source) return
    const data = source.toObject()
    delete data._id
    data.origin = effect.uuid
    data.flags = foundry.utils.mergeObject(data.flags ?? {}, {
      [sys_id]: { [LightSourceUtil.RULE_FX_FLAG]: effect.uuid },
    })
    await actor.createEmbeddedDocuments("ActiveEffect", [data])
  }

  private static async applyStatus(token: any, effect: AppliedEffect) {
    const actor = token.actor
    const { status, damageType, die } = effect
    if (isImmuneToStatus(actor, status)) return
    if (status === "burning" && isImmuneToBurning(actor, damageType)) return

    StatusEffectUtil.toggleStatusEffectOnce(actor, status, true)
    if (
      die <= 0 ||
      CountdownManager.hasStatus(
        actor.uuid,
        token.document.uuid,
        status,
        damageType,
      )
    )
      return

    await CountdownManager.add(
      `${token.name}: ${appLang.StatusConditions[status]?.name ?? status}`,
      die,
      undefined,
      undefined,
      actor.uuid,
      token.document.uuid,
      { id: status, damageType: damageType || undefined },
    )
  }

  /** Tokens within reach of a sunlight/moonlight source get the matching in-light effect. */
  static async syncAmbientLightModifiers() {
    if (!game.user?.isActiveGM || !canvas?.ready) return
    await LightSourceUtil.settleAnimations(LightSourceUtil.sceneTokens())
    if (!canvas?.ready) return
    await LightSourceUtil.loadEffects()

    const emitters = [
      ...LightSourceUtil.tokenEmitters(),
      ...LightSourceUtil.ambientEmitters(),
    ]
    const reached = (target: any, type: LightKind) =>
      emitters.some(
        (e) => e.type === type && LightSourceUtil.reaches(target, e),
      )

    await Promise.all(
      LightSourceUtil.sceneTokens()
        .filter((t) => t.actor && t.actor.type !== "container")
        .map(async (target) => {
          const wanted = {
            sunlight: reached(target, "sunlight"),
            moonlight: reached(target, "moonlight"),
          }
          await LightSourceUtil.reconcileEffects(target.actor, wanted)
          await LightSourceUtil.reconcileApplied(target, wanted)
        }),
    )
  }

  // ---------------------------------------------------------------------------
  // Sync scheduling and hooks
  // ---------------------------------------------------------------------------

  /** Runs never overlap: a trigger during a run queues exactly one follow-up. */
  private static async runSerialized() {
    if (LightSourceUtil.syncRunning) {
      LightSourceUtil.syncQueued = true
      return
    }
    LightSourceUtil.syncRunning = true
    try {
      do {
        LightSourceUtil.syncQueued = false
        await LightSourceUtil.syncAmbientLightModifiers()
      } while (LightSourceUtil.syncQueued)
    }
    finally {
      LightSourceUtil.syncRunning = false
    }
  }

  private static scheduleSync() {
    clearTimeout(LightSourceUtil.syncTimer)
    LightSourceUtil.syncTimer = setTimeout(
      () => LightSourceUtil.runSerialized(),
      250,
    )
  }

  private static registerSyncHooks() {
    const schedule = () => LightSourceUtil.scheduleSync()
    for (const hook of [
      "canvasReady",
      "createToken",
      "updateToken",
      "moveToken",
      "deleteToken",
      "createItem",
      "updateItem",
      "deleteItem",
      "createWall",
      "updateWall",
      "deleteWall",
      "createAmbientLight",
      "updateAmbientLight",
      "deleteAmbientLight",
    ])
      Hooks.on(hook as any, schedule)
  }

  /** Newly created tokens pick up their actor's lit item right away. */
  private static registerTokenLightHook() {
    Hooks.on("createToken", (token: any, _options: any, userId: string) => {
      if (game.user?.id !== userId) return
      const best = LightSourceUtil.bestSource(token.actor)
      if (best) token.update(LightSourceUtil.tokenLightUpdate(best))
    })
  }

  static startTimer() {
    if (LightSourceUtil.tickerId) return
    LightSourceUtil.tickerId = setInterval(
      () => LightSourceUtil.expireSpentSources(),
      1000,
    )
    LightSourceUtil.registerTokenOverlay()
    LightSourceUtil.registerSyncHooks()
    LightSourceUtil.registerTokenConfigControl()
    LightSourceUtil.registerTokenLightHook()
  }

  // ---------------------------------------------------------------------------
  // UI: light config radio group, token overlay icon
  // ---------------------------------------------------------------------------

  private static lightTypeRadioGroup(current: string): HTMLElement {
    const name = LightSourceUtil.typeFlagPath()
    const option = (value: string, label: string) =>
      `<label style="display:inline-flex;gap:4px;margin-right:12px;align-items:center">
          <input type="radio" name="${name}" value="${value}" ${current === value ? "checked" : ""}>${label}
        </label>`
    const group = document.createElement("div")
    group.className = "form-group"
    group.dataset.vagabondLightType = "true"
    group.innerHTML = `
        <label>${appLang.ItemSheet.lightType}</label>
        <div class="form-fields">
          ${option("none", appLang.ItemSheet.lightTypeNone)}
          ${option("sunlight", appLang.ItemSheet.sunlight)}
          ${option("moonlight", appLang.ItemSheet.moonlight)}
        </div>
        <p class="hint">${appLang.ItemSheet.lightTypeHint}</p>`
    return group
  }

  /** Adds a sunlight/moonlight radio group to the native token and ambient light config windows. */
  private static registerTokenConfigControl() {
    const inject = (app: any, html: any) => {
      const root: HTMLElement = html instanceof HTMLElement ? html : html?.[0]
      const negative = root?.querySelector?.(
        '[name="light.negative"], [name="config.negative"]',
      )
      const anchor = negative?.closest(".form-group")
      if (!anchor || root.querySelector(`[data-vagabond-light-type]`)) return

      const current =
        app.document?.getFlag?.(sys_id, LightSourceUtil.TYPE_FLAG) ?? "none"
      anchor.after(LightSourceUtil.lightTypeRadioGroup(current))
    }
    for (const hook of [
      "renderTokenConfig",
      "renderPrototypeTokenConfig",
      "renderAmbientLightConfig",
      "renderAmbientLightPalette",
    ])
      Hooks.on(hook as any, inject)
  }

  /* Small, round icon in upper right of Actor's token when emitting light from an item. */
  private static registerTokenOverlay() {
    const refreshActorTokens = (item: any) => {
      const actor = item?.parent
      if (!actor?.getActiveTokens) return
      for (const token of actor.getActiveTokens() as any[]) {
        token.renderFlags?.set({ refreshState: true })
      }
    }
    Hooks.on("createItem", refreshActorTokens)
    Hooks.on("updateItem", refreshActorTokens)
    Hooks.on("deleteItem", refreshActorTokens)

    Hooks.on("refreshToken" as any, (token: any) => {
      const PIXI = (globalThis as any).PIXI
      if (!PIXI || !token?.document) return

      const pileData = token.document.getFlag?.("item-piles", "data")
      const hideForPile = !!pileData?.enabled && pileData.type !== "merchant"
      const lit = hideForPile
        ? undefined
        : LightSourceUtil.bestSource(token.actor)
      let overlay = token._vagabondLightIcon
      if (!lit) {
        if (overlay) overlay.visible = false
        return
      }

      if (!overlay || overlay.destroyed) {
        overlay = new PIXI.Container()
        overlay.eventMode = "none"
        overlay.sprite = new PIXI.Sprite()
        overlay.mask = new PIXI.Graphics()
        overlay.border = new PIXI.Graphics()
        overlay.addChild(overlay.sprite, overlay.mask, overlay.border)
        overlay.sprite.mask = overlay.mask
        token._vagabondLightIcon = overlay
        token.addChild(overlay)
      }
      if (overlay.src !== lit.img) {
        overlay.src = lit.img
        overlay.sprite.texture = PIXI.Texture.from(lit.img)
      }

      const size = Math.max(12, Math.min(token.w, token.h) * 0.3)
      const radius = size / 2
      overlay.sprite.width = size
      overlay.sprite.height = size
      overlay.mask
        .clear()
        .beginFill(0xffffff)
        .drawCircle(radius, radius, radius)
        .endFill()
      overlay.border
        .clear()
        .lineStyle(Math.max(1, size * 0.08), 0x000000, 1)
        .drawCircle(radius, radius, radius)
      overlay.position.set(token.w - size, 0)
      overlay.visible = true
    })
  }

  // ---------------------------------------------------------------------------
  // Player actions: refuel and light toggle context menu
  // ---------------------------------------------------------------------------

  private static findOils(owner: any): any[] {
    return (
      owner?.items?.filter(
        (i: any) =>
          i.type === "alchemical" && i.system?.alchemyCategory === "oil",
      ) ?? []
    )
  }

  static async refuel(item: any) {
    const oils = LightSourceUtil.findOils(item.parent?.parent)
    if (oils.length === 0) return

    let chosenId: string | undefined
    const confirmed = await showConfirmationDialog({
      title: appLang.ItemSheet.refuelTitle,
      description: localizeString(appLang.ItemSheet.refuelDescription, {
        name: item.parent.name,
      }),
      confirmText: appLang.ItemSheet.refuel,
      variant: "primary",
      selectOptions: oils.map((o: any) => ({
        label:
          o.system.bulk?.quantity > 1
            ? `${o.name} (x${o.system.bulk.quantity})`
            : o.name,
        value: o.id,
      })),
      onConfirm: (id) => {
        chosenId = id
      },
    })
    const oil = confirmed ? oils.find((o: any) => o.id === chosenId) : undefined
    if (!oil) return

    await oil.delete({ deleteVagabondStack: false })
    await item.parent.update({
      "system.lightSourceData": {
        isFueled: true,
        isLit: false,
        remaining: item.lightSourceData.duration,
        litTS: 0,
      },
    })
  }

  static contextMenuOption(
    item: any,
    isHeld: boolean = true,
  ): CtxMenuItem | undefined {
    const data = item?.lightSourceData
    if (
      !data?.isLightSource ||
      item.parent?.type === "weapon" ||
      LightSourceUtil.isUnbound(item)
    )
      return undefined
    if (data.isLit) {
      return {
        icon: LightbulbOff,
        label: appLang.HeroSheet.Inventory.ctxDeactivateLight,
        action: () =>
          item.parent.update({ "system.lightSourceData.isLit": false }),
      }
    }
    if (data.requiresFuel && !data.isFueled) {
      if (LightSourceUtil.findOils(item.parent?.parent).length === 0)
        return undefined
      return {
        icon: FlaskRound,
        label: appLang.HeroSheet.Inventory.ctxRefuelLight,
        action: () => LightSourceUtil.refuel(item),
      }
    }
    if (!LightSourceUtil.hasFuel(data) || (isHeld && !item.isEquipped))
      return undefined
    return {
      icon: Lightbulb,
      label: appLang.HeroSheet.Inventory.ctxActivateLight,
      action: () =>
        item.parent.update({ "system.lightSourceData.isLit": true }),
    }
  }

}
