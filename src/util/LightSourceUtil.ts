import { FlaskRound, Lightbulb, LightbulbOff } from "lucide-react"

import { showConfirmationDialog } from "../apps/vagabond-tools/dialog/ConfirmationDialogUseCase"
import { getRealtimeLightsources } from "../apps/vagabond-tools/usecase/VagabondSettingsHelper"
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
}

export class LightSourceUtil {
  private static readonly LIGHT_FLAG = "lightSourceItemId"
  private static readonly NO_LIGHT = { dim: 0, bright: 0 }
  private static tickerId?: ReturnType<typeof setInterval>

  private static buildLight(data: {
    range: number
    color: string
    isDark?: boolean
    isSunlight?: boolean
    isMoonlight?: boolean
  }) {
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

    const light = best
      ? LightSourceUtil.buildLight(best.system.lightSourceData)
      : LightSourceUtil.NO_LIGHT
    const tokens = (actor.getActiveTokens?.(false, true) ?? []) as any[]

    await Promise.all([
      actor.update({
        "prototypeToken.light": light,
        [best
          ? `flags.${sys_id}.${LightSourceUtil.LIGHT_FLAG}`
          : `flags.${sys_id}.-=${LightSourceUtil.LIGHT_FLAG}`]: best
          ? best.id
          : null,
      }),
      ...tokens.map((token) => token.update({ light })),
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

  static startTimer() {
    if (LightSourceUtil.tickerId) return
    LightSourceUtil.tickerId = setInterval(
      () => LightSourceUtil.expireSpentSources(),
      1000,
    )
    LightSourceUtil.registerTokenOverlay()

    Hooks.on("createToken", (token: any, _options: any, userId: string) => {
      if (game.user?.id !== userId) return
      const best = LightSourceUtil.bestSource(token.actor)
      if (best)
        token.update({
          light: LightSourceUtil.buildLight(best.system.lightSourceData),
        })
    })
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
