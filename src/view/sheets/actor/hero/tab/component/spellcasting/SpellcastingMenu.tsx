import { BookMarked, Dices } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { isMovement } from "../../../../../../../apps/focus-manager/focus-hook-rules"
import { getMiniCardsPref } from "../../../../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroAttack } from "../../../../../../../combat/engine/HeroAttack"
import { AreaColor } from "../../../../../../../combat/spellcasting/aoe/AreaColor"
import { AreaRenderer } from "../../../../../../../combat/spellcasting/aoe/AreaRenderer"
import type { Point } from "../../../../../../../combat/spellcasting/aoe/AreaTypes"
import { CubePreview } from "../../../../../../../combat/spellcasting/aoe/control/CubePreview"
import { LinePreview } from "../../../../../../../combat/spellcasting/aoe/control/LinePreview"
import { SpherePreview } from "../../../../../../../combat/spellcasting/aoe/control/SpherePreview"
import { WheelResizeListener } from "../../../../../../../combat/spellcasting/aoe/control/WheelResizeListener"
import { IconLayer } from "../../../../../../../combat/spellcasting/aoe/IconLayer"
import { AreaOccupants } from "../../../../../../../combat/spellcasting/aoe/targeting/AreaOccupants"
import { AreaTargeter } from "../../../../../../../combat/spellcasting/aoe/targeting/AreaTargeter"
import { AreaOfEffectDelivery, Aura, Cone, Cube, getNewDeliveryOptions, Glyph, Imbue, Line, PerTargetDelivery, PlacedArea, Remote, SpellDelivery, SpellSnapshot, Sphere } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { HeroDataModel } from "../../../../../../../model/actor/HeroDataModel"
import { ItemsCache } from "../../../../../../../rules/util/ItemsCache"
import { sys_id } from "../../../../../../../util/foundry-util"
import { appLang } from "../../../../../../../util/lang"
import { LightSourceUtil } from "../../../../../../../util/LightSourceUtil"
import { tableBorder } from "../../../../../../common/border-styles"
import { buttonAnimation } from "../../../../../../component/Button"
import { DamageTypeIcon } from "../../../../../../component/DamageTypeIcon"
import { Tooltip } from "../../../../../../component/Tooltip"
import { DeliverySelector } from "./input/DeliverySelectior"
import { DiceCountInput } from "./input/DiceCountInput"
import { LineExpansionInut } from "./input/LineExpansionInput"
import { ManaDiscount } from "./input/ManaDiscount"
import { SkillSelector } from "./input/SkillSelector"
import { SpellcastingErrMsg, SpellcastingLabel, SpellcastingSubtext } from "./input/SpellcastingTypography"
import { SpellEffectToggle } from "./input/SpellEffectToggle"
import { SpellFocusToggle } from "./input/SpellFocusToggle"
import { SpellRangeInput } from "./input/SpellRangeInput"
import { SpellSelector } from "./input/SpellSelector"
import { SpellTargetInput } from "./input/SpellTargetInput"
import { TotalMana } from "./input/TotalMana"
import { UpcastingInput } from "./input/UpcastingInput"

interface SpellcastingMenuState {
  skill: string
  spellUuid: string
  deliveryName: string
  damageDice: number
  studyDamageDice: number
  applyEffect: boolean
  isFocused: boolean
  discount: number
  size?: number
  height?: number
  width?: number
  targetCount?: number
}

export const useSpellCastingMenu = (
  actor: Actor & { system: HeroDataModel },
  imbueMode?: boolean,
  windowedMode?: boolean,
  onCast?: () => void,
  imbueTarget?: { actorId: string; attackId: string },
  onClose?: () => void,
) => {
  const hero = actor.system
  const useMiniCards = getMiniCardsPref(actor.id!)

  const [isSpellcastingOpen, setIsSpellcastingOpen] = useState(false)
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null)
  const [skill, setSkill] = useState(hero.class?.castingSkill ?? "arcana")
  const [deliveries, setDeliveries] = useState<SpellDelivery[]>([])
  const [deliveryIndex, setDeliveryIndex] = useState<number>(6)

  const spells = useMemo((): SpellSnapshot[] => {
    const allSpells = ItemsCache.spells()
      .filter((it) => hero.spells.map((sp) => sp._sourceId).includes(it.uuid))
      .map((sp) => SpellDelivery.getSpellSnapshot(sp))
    return allSpells
  }, [
    actor,
    JSON.stringify(actor.system.class?.rules ?? []),
    JSON.stringify(hero.spells.map((sp) => sp._sourceId)),
  ])

  useEffect(() => {
    const savedState = actor.getFlag(
      sys_id,
      `spellcastingMenuState${imbueMode ? "_imbue" : ""}` as any,
    ) as SpellcastingMenuState | undefined
    const spell =
      spells.find((sp) => sp.uuid === savedState?.spellUuid) ?? spells[0]
    const allDeliveryOptions = getNewDeliveryOptions(spell, {
      ...actor.system.modifiers.casting,
    })
    const deliveryOptions = imbueMode
      ? allDeliveryOptions.filter(
          (d) => d.name === appLang.SpellDeliveries.imbue.name,
        )
      : allDeliveryOptions

    if (imbueMode) setDeliveryIndex(0)

    if (savedState && Object.keys(savedState).length > 0) {
      const index = deliveryOptions.findIndex(
        (d) => d.name === savedState.deliveryName,
      )
      if (index !== -1) {
        const delivery = deliveryOptions[index]
        delivery.setDamageDice(savedState.damageDice)
        delivery.setStudyDamageDice(savedState.studyDamageDice)
        delivery.setApplyEffect(savedState.applyEffect)
        delivery.setIsFocused(savedState.isFocused)
        delivery.setDiscount(savedState.discount)
        if (
          delivery instanceof AreaOfEffectDelivery &&
          savedState.size !== undefined
        ) {
          delivery.setSize(savedState.size)
        }
        if (
          delivery instanceof Line &&
          savedState.height !== undefined &&
          savedState.width !== undefined
        ) {
          delivery.setHeight(savedState.height)
          delivery.setWidth(savedState.width)
        }
        if (
          delivery instanceof PerTargetDelivery &&
          savedState.targetCount !== undefined
        ) {
          delivery.setTargetCount(savedState.targetCount)
        }
        setDeliveryIndex(index)
      }

      setSelectedSpellId(
        hero.spells.some((sp) => sp._sourceId === savedState?.spellUuid)
          ? (savedState.spellUuid ?? null)
          : (hero.spells[0]?._sourceId ?? null),
      )

      setSkill(savedState.skill)
    }

    setDeliveries(deliveryOptions)
  }, [])

  const castingModsJson = JSON.stringify(actor.system.modifiers.casting ?? {})
  useEffect(() => {
    setDeliveries((prev) => {
      if (prev.length === 0 || JSON.stringify(prev[0].mods) === castingModsJson)
        return prev
      const mods = { ...actor.system.modifiers.casting }
      return prev.map((d) => {
        const clone = d.clone()
        clone.setMods(mods)
        return clone
      })
    })
  }, [castingModsJson])

  /** Clones every delivery, lets `change` modify the clone, and stores the result. */
  const updateDeliveries = useCallback(
    (change: (clone: SpellDelivery) => void) =>
      setDeliveries((prev) =>
        prev.map((d) => {
          const clone = d.clone()
          change(clone)
          return clone
        }),
      ),
    [],
  )

  const onUpdateTargetTokens = useCallback(
    (tokens: Token[]) =>
      updateDeliveries((d) => {
        if (d instanceof PerTargetDelivery)
          d.setTargetTokenIds(tokens.map((t) => t.id))
      }),
    [updateDeliveries],
  )

  /**
   * A hook that listens to their token targeting events and
   * updates the target count for Remote & Imbue.
   */
  useEffect(() => {
    const handleTargetChange = (user) => {
      if (user.id !== game.user?.id) return
      onUpdateTargetTokens(Array.from(game.user?.targets ?? []))
    }
    const hookId = Hooks.on("targetToken", handleTargetChange)
    return () => {
      Hooks.off("targetToken", hookId)
    }
  }, [onUpdateTargetTokens])

  const onSelectSpell = useCallback(
    (uuid: string) => {
      const sp = spells.find((it) => it.uuid === uuid)
      setSelectedSpellId(uuid)
      if (sp) updateDeliveries((d) => d.setSpell(sp))
    },
    [spells, updateDeliveries],
  )

  const onSelectDelivery = useCallback((index) => {
    setDeliveryIndex(index)
  }, [])

  const onSelectSkill = useCallback((skill: string) => setSkill(skill), [])

  const onUpdateAreaSize = useCallback(
    (input: string | null) =>
      updateDeliveries((d) => {
        if (d instanceof AreaOfEffectDelivery)
          d.setSize(Math.round(Number(input) / d.increment) * d.increment)
      }),
    [updateDeliveries],
  )

  const onUpdateLineHeight = useCallback(
    (h: string) =>
      updateDeliveries((d) => {
        if (d instanceof Line) d.setHeight(Math.round(Number(h) / 5) * 5)
      }),
    [updateDeliveries],
  )

  const onUpdateLineWidth = useCallback(
    (w: string) =>
      updateDeliveries((d) => {
        if (d instanceof Line) d.setWidth(Math.round(Number(w) / 5) * 5)
      }),
    [updateDeliveries],
  )

  const onUpdateDamageDice = useCallback(
    (input: string | null) => {
      const dice = Math.max(0, Number(input) || 0)
      updateDeliveries((d) => d.setDamageDice(dice))
    },
    [updateDeliveries],
  )

  const onUpdateStudyDamageDice = useCallback(
    (input: string | null) => {
      const dice = Math.max(0, Number(input) || 0)
      updateDeliveries((d) =>
        d.setStudyDamageDice(Math.min(hero.statuses.counters.studied, dice)),
      )
    },
    [updateDeliveries, hero.statuses.counters.studied],
  )

  const onUpdateUpcast = useCallback(
    (input: string | null) => {
      const upcast = Math.max(0, Number(input) || 0)
      updateDeliveries((d) => d.setUpcast(upcast))
    },
    [updateDeliveries],
  )

  const onToggleSpellEffect = useCallback(
    (isChecked: boolean) =>
      updateDeliveries((d) => d.setApplyEffect(isChecked)),
    [updateDeliveries],
  )

  const onToggleSpellFocus = useCallback(
    (isChecked: boolean) => updateDeliveries((d) => d.setIsFocused(isChecked)),
    [updateDeliveries],
  )

  const onUpdateDiscount = useCallback(
    (discount: number) => updateDeliveries((d) => d.setDiscount(discount)),
    [updateDeliveries],
  )

  const onUpdateTargetCount = useCallback(
    (input: string | null) => {
      const count = Math.max(1, Number(input) || 1)
      updateDeliveries((d) => {
        if (d instanceof PerTargetDelivery) d.setTargetCount(count)
      })
    },
    [updateDeliveries],
  )

  const activeDelivery = deliveries[deliveryIndex]
  const damageType = activeDelivery?.spell?.damageType
  // Only an Aura lets the caster choose; other areas hit everyone inside.
  const targetingPref =
    activeDelivery instanceof Aura
      ? activeDelivery.spell?.autoTargetingPref
      : "all"
  const renderer = useMemo(() => new AreaRenderer(), [])
  const targeter = useMemo(() => new AreaTargeter(), [])
  renderer.setDamageType(damageType)
  const autoTargetRef = useRef<string | undefined>(undefined)
  autoTargetRef.current = targetingPref
  // The squares the caster has marked, kept so a Focused cast can leave them on the canvas.
  const placedRef = useRef<Point[]>([])
  /** Targets the tokens inside the area that the spell's auto-targeting preference selects. */
  const targetArea = useCallback(
    (covered: Point[]) => {
      placedRef.current = covered
      targeter.target(covered, autoTargetRef.current)
    },
    [targeter],
  )

  useEffect(() => {
    placedRef.current = []
  }, [deliveryIndex, isSpellcastingOpen])

  const previewShape =
    isSpellcastingOpen && activeDelivery instanceof Aura
      ? "aura"
      : isSpellcastingOpen && activeDelivery instanceof Cone
        ? "cone"
        : undefined
  const previewSize = previewShape ? (activeDelivery as Aura | Cone).size : 0

  /** Previews an Aura's or Cone's reach on the grid while its size is being adjusted. */
  useEffect(() => {
    if (!previewShape || !previewSize) return
    let cancelled = false
    const show = () =>
      targetArea(
        previewShape === "aura"
          ? renderer.showAura(actor, previewSize)
          : renderer.showCone(actor, previewSize),
      )
    show()
    // Positions and rotation are staged while a token animates, so redraw once it has settled.
    const hookId = Hooks.on("updateToken", async (doc: any, changed: any) => {
      if (doc.actorId !== actor.id) return
      if (
        previewShape === "cone" &&
        !("rotation" in changed) &&
        !isMovement(changed)
      )
        return
      if (doc.object) await LightSourceUtil.settleAnimations([doc.object])
      if (!cancelled) show()
    })
    return () => {
      cancelled = true
      Hooks.off("updateToken", hookId)
      renderer.clear()
    }
  }, [
    previewShape,
    previewSize,
    actor,
    damageType,
    targetingPref,
    targetArea,
    renderer,
  ])

  const isSpherePreview = isSpellcastingOpen && activeDelivery instanceof Sphere
  const previewSizeRef = useRef(previewSize)
  previewSizeRef.current = previewSize

  /** Shift+scroll resizes an Aura or Cone. */
  useEffect(() => {
    if (!previewShape) return
    const area = activeDelivery as Aura | Cone
    const listener = new WheelResizeListener({
      getSize: () => previewSizeRef.current,
      minSize: area.baseSize,
      step: area.increment,
      onResize: (size) => onUpdateAreaSize(String(size)),
    })
    listener.start()
    return () => listener.stop()
  }, [previewShape, onUpdateAreaSize])
  const sphereSize = isSpherePreview ? (activeDelivery as Sphere).size : 0
  const sphereSizeRef = useRef(sphereSize)
  sphereSizeRef.current = sphereSize
  const spherePreview = useRef<SpherePreview | undefined>(undefined)

  /** The Sphere's area follows the cursor; Shift+scroll resizes it and a click pins it. */
  useEffect(() => {
    if (!isSpherePreview) return
    const sphere = activeDelivery as Sphere
    const preview = new SpherePreview(renderer, {
      getSize: () => sphereSizeRef.current,
      minSize: sphere.baseSize,
      step: sphere.increment,
      onResize: (size) => onUpdateAreaSize(String(size)),
      onArea: targetArea,
    })
    spherePreview.current = preview
    preview.start()
    return () => {
      preview.stop()
      spherePreview.current = undefined
    }
  }, [isSpherePreview, onUpdateAreaSize, targetArea, renderer])

  useEffect(() => {
    spherePreview.current?.refresh()
  }, [sphereSize, damageType, targetingPref])

  const isCubePreview = isSpellcastingOpen && activeDelivery instanceof Cube

  /** Clicking the canvas drops a Cube there and raises the Cube count. */
  useEffect(() => {
    if (!isCubePreview) return
    const preview = new CubePreview(renderer, {
      onCount: (count) => onUpdateTargetCount(String(count)),
      onArea: targetArea,
    })
    preview.start()
    return () => preview.stop()
  }, [isCubePreview, onUpdateTargetCount, targetArea, renderer])

  const isGlyphPreview = isSpellcastingOpen && activeDelivery instanceof Glyph

  /** A Glyph is a single square; clicking again moves it. */
  useEffect(() => {
    if (!isGlyphPreview) return
    const preview = new CubePreview(renderer, {
      limit: 1,
      onArea: targetArea,
      icon: IconLayer.GLYPH,
    })
    preview.start()
    return () => preview.stop()
  }, [isGlyphPreview, targetArea, renderer])

  const isLinePreview = isSpellcastingOpen && activeDelivery instanceof Line
  const line = isLinePreview ? (activeDelivery as Line) : undefined
  const lineLength = line?.size ?? 0
  const lineWidth = line?.width ?? 0
  const lineRef = useRef({ length: lineLength, width: lineWidth })
  lineRef.current = { length: lineLength, width: lineWidth }
  const linePreview = useRef<LinePreview | undefined>(undefined)

  /** The Line's area follows the cursor; Shift/Alt+scroll change length/width, Ctrl+scroll rotates, click pins. */
  useEffect(() => {
    if (!isLinePreview) return
    const l = activeDelivery as Line
    const preview = new LinePreview(renderer, {
      getLength: () => lineRef.current.length,
      getWidth: () => lineRef.current.width,
      lengthStep: l.increment,
      minLength: l.baseSize,
      widthStep: 5,
      minWidth: l.baseWidth,
      onLength: (feet) => onUpdateAreaSize(String(feet)),
      onWidth: (feet) => onUpdateLineWidth(String(feet)),
      onArea: targetArea,
    })
    linePreview.current = preview
    preview.start()
    return () => {
      preview.stop()
      linePreview.current = undefined
    }
  }, [isLinePreview, onUpdateAreaSize, onUpdateLineWidth, targetArea, renderer])

  useEffect(() => {
    linePreview.current?.refresh()
  }, [lineLength, lineWidth, damageType, targetingPref])

  const targetOrAreaInput = () => {
    if (deliveries[deliveryIndex] instanceof AreaOfEffectDelivery) {
      return (
        <>
          <SpellRangeInput
            size={deliveries[deliveryIndex].size}
            label={deliveries[deliveryIndex].targetLabel}
            onUpdateAreaSize={onUpdateAreaSize}
            increment={deliveries[deliveryIndex].increment}
          />
        </>
      )
    }
    else if (deliveries[deliveryIndex] instanceof PerTargetDelivery) {
      const delivery = deliveries[deliveryIndex]
      if (delivery.targetLimit === 0) {
        return (
          <SpellTargetInput
            delivery={delivery}
            onUpdateTargetCount={onUpdateTargetCount}
            readOnly={delivery instanceof Remote || delivery instanceof Imbue}
          />
        )
      }
    }
  }

  const renderLineExpansions = () => {
    if (deliveries[deliveryIndex] instanceof Line) {
      return (
        <LineExpansionInut
          delivery={deliveries[deliveryIndex]}
          onUpdateHeight={onUpdateLineHeight}
          onUpdateWidth={onUpdateLineWidth}
        />
      )
    }
    return null
  }

  const saveSpellcastingMenuState = useCallback(
    async (delivery: SpellDelivery) => {
      const state: SpellcastingMenuState = {
        skill,
        spellUuid: delivery.spell.uuid,
        deliveryName: delivery.name,
        damageDice: delivery.damageDice,
        studyDamageDice: delivery.studyDamageDice,
        applyEffect: delivery.applyEffect,
        isFocused: delivery.isFocused,
        discount: delivery.discount,
        size:
          delivery instanceof AreaOfEffectDelivery ? delivery.size : undefined,
        height: delivery instanceof Line ? delivery.height : undefined,
        width: delivery instanceof Line ? delivery.width : undefined,
        targetCount:
          delivery instanceof PerTargetDelivery
            ? delivery.targetCount
            : undefined,
      }
      await actor.setFlag(
        sys_id,
        `spellcastingMenuState${imbueMode ? "_imbue" : ""}` as any,
        state,
      )
    },
    [actor, skill],
  )

  // Deliveries are replaced (never mutated) on every form change, so this saves each one.
  useEffect(() => {
    const delivery = deliveries[deliveryIndex]
    if (actor.isOwner && delivery?.spell) saveSpellcastingMenuState(delivery)
  }, [
    actor.isOwner,
    deliveries,
    deliveryIndex,
    skill,
    saveSpellcastingMenuState,
  ])

  /** The marked area, if this delivery has one and the caster has marked it. */
  const focusedArea = (delivery: SpellDelivery): PlacedArea | undefined => {
    const hasArea =
      delivery instanceof AreaOfEffectDelivery ||
      delivery instanceof Cube ||
      delivery instanceof Glyph
    const sceneId = canvas?.scene?.id
    if (!hasArea || !sceneId || !placedRef.current.length) return undefined
    const followsCaster = delivery instanceof Aura || delivery instanceof Cone
    return {
      sceneId,
      ...(followsCaster && {
        follow: {
          kind:
            delivery instanceof Aura ? ("aura" as const) : ("cone" as const),
          size: delivery.size,
          actorId: actor.id ?? "",
        },
      }),
      cells: (followsCaster ? [] : placedRef.current).map((p) => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
      })),
      color: AreaColor.of(delivery.spell.damageType),
      ...(delivery instanceof Glyph && { icon: IconLayer.GLYPH }),
    }
  }

  /** Non-Aura areas hit everyone inside, so the targets must match exactly who is in the marked area. */
  const targetsMismatchArea = (delivery: SpellDelivery): boolean => {
    const hasArea =
      delivery instanceof AreaOfEffectDelivery ||
      delivery instanceof Cube ||
      delivery instanceof Glyph
    if (!hasArea || delivery instanceof Aura || !placedRef.current.length)
      return false
    const inside = new Set<string>(
      AreaOccupants.targetsIn(placedRef.current, "all").map(
        (t) => t.id as string,
      ),
    )
    const targeted = new Set<string>(
      Array.from(game.user?.targets ?? []).map((t: any) => t.id as string),
    )
    return (
      inside.size !== targeted.size ||
      [...inside].some((id) => !targeted.has(id))
    )
  }

  const castSpell = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hero.parent.isOwner) return
    const delivery = deliveries[deliveryIndex]
    if (delivery && delivery.spell) {
      const focusCount = hero.parent.system.statuses?.counters?.focus ?? 0
      const maxFocus = hero.parent.system.maxFocus
      if (delivery.isFocused && maxFocus > 1 && focusCount >= maxFocus) {
        ui.notifications?.warn(appLang.Spellcasting.maxFocusMessage)
        return
      }
      if (targetsMismatchArea(delivery)) {
        ui.notifications?.warn(appLang.Spellcasting.castTargetsMismatchArea)
        return
      }
      onUpdateStudyDamageDice("0")
      await saveSpellcastingMenuState(delivery)
      const sk = skill && skill.length > 0 ? skill : "arcana"
      let cast = true
      let target = imbueTarget
      if (!target && delivery instanceof Imbue) {
        const latest = HeroAttack.findLatestWeaponAttack()
        if (!latest || latest.isResolved) {
          ui.notifications?.error(appLang.Notifications.imbueAttackResolved)
          return
        }
        target = { actorId: latest.actorId, attackId: latest.attackId }
      }
      if (target) {
        cast = await HeroAttack.imbueAttack(
          hero.parent,
          sk,
          delivery,
          target,
          e,
        )
      }
      else {
        const area = delivery.isFocused ? focusedArea(delivery) : undefined
        const toCast = area
          ? Object.assign(delivery.clone(), { area })
          : delivery
        HeroAttack.buildSpellAttack(hero.parent, sk, toCast, e)?.initiate(e, {
          requireFocusUpkeep: true,
        })
      }
      onCast?.()
      if (imbueMode && cast) onClose?.()
    }
  }

  const SpellcastingMenu = () => {
    const delivery = deliveries[deliveryIndex]
    const spell = delivery?.spell

    return (
      <>
        {isSpellcastingOpen && delivery && spell && (
          <div
            className={`flex flex-col font-eskapade font-bold bg-context-menu-fill -mt-1 p-1 ${windowedMode || imbueMode ? "" : `mb-1 ${tableBorder}`}`}
          >
            {/* SPELLCASTING MENU TOP ROW */}
            <div className="flex gap-x-0.5 items-end text-lg w-full min-w-0">
              {/* SELECTORS */}
              {(!useMiniCards || imbueMode || windowedMode) && (
                <SpellSelector
                  spell={delivery.spell}
                  spells={spells}
                  onSelect={onSelectSpell}
                />
              )}
              {!imbueMode && (
                <DeliverySelector
                  deliveries={deliveries}
                  currentDelivery={delivery}
                  onSelect={onSelectDelivery}
                />
              )}
              {imbueMode && (
                <div>
                  <SpellcastingLabel
                    text={appLang.HeroSheet.Magic.labelDelivery}
                  />
                  <p className="px-1 py-0.5 text-base">{delivery.name}</p>
                </div>
              )}

              {!hero.class.castingSkill && (
                <SkillSelector skill={skill} onSelectSkill={onSelectSkill} />
              )}

              {/* CAST BUTTON */}
              <div className="@container ml-auto flex-shrink min-w-0 max-w-[100px] w-full">
                <Tooltip
                  title={`Cast: ${delivery?.spell.name} (${delivery?.manaCost ?? 0} Mana)`}
                  content={`${delivery?.name ?? ""} | ${delivery?.targetLabel}: ${(delivery as any).targetCount ?? (delivery as any).size ?? ""}<br>${appLang.HeroSheet.skills_tooltip}`}
                >
                  <button
                    type="button"
                    onClick={(e: any) => castSpell(e)}
                    className={`
                                        flex text-btn-primary-text justify-center font-eskapade
                                        bg-btn-primary-fill rounded px-2 py-2 w-full min-w-0 ${buttonAnimation}
                                    `}
                  >
                    <div className="flex gap-x-1 items-center min-w-0 whitespace-nowrap text-[calc(10cqw+8px)] max-text-base">
                      {spell.damageType !== "none" && (
                        <span className="w-[1.0em] h-[1.0em] flex items-center justify-center flex-shrink-0">
                          <DamageTypeIcon
                            dmgType={spell.damageType ?? ""}
                            size={"100%" as any}
                          />
                        </span>
                      )}
                      {appLang.HeroSheet.Magic.btnCast}
                    </div>
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* SECOND ROW, DELIVERY CUSTOMIZATION INPUTS */}
            <div className="flex flex-wrap gap-2 items-end mt-2">
              {/* TARGET COUNT, AREA INPUT, AND LINE EXPANSIONS */}
              <div className="flex gap-x-1 items-end">
                {targetOrAreaInput()}
                {renderLineExpansions()}
              </div>

              <div className="flex gap-x-1 ml-auto items-end font-eskapade">
                {spell.damageType !== "none" && (
                  <div className="flex gap-x-1">
                    {/* DAMAGE DICE INPUT */}
                    <div className="flex flex-col">
                      <div className="flex gap-x-1">
                        <Dices
                          size={18}
                          className="self-center text-text-header-tertiary"
                        />
                        <p className="text-sm text-text-header-tertiary font-bold">
                          d{hero.modifiers.damage.out.spell.dice.size.bonus + 6}
                        </p>
                      </div>
                      <DiceCountInput
                        dmgDice={delivery?.damageDice}
                        onUpdateDmgDice={onUpdateDamageDice}
                      />
                    </div>

                    {/* IF THE CLASS CAN USE STUDIED DICE AS DAMAGE */}
                    {hero.modifiers.casting.studyDiceDamage && (
                      <div className="flex flex-col">
                        <div className="flex gap-x-1">
                          <BookMarked
                            size={18}
                            className="text-ic-studied self-center"
                          />
                          <p className="text-sm text-text-header-tertiary font-bold">
                            d6
                          </p>
                        </div>
                        <DiceCountInput
                          dmgDice={delivery?.studyDamageDice}
                          onUpdateDmgDice={onUpdateStudyDamageDice}
                        />
                      </div>
                    )}
                  </div>
                )}

                {spell.upcastableEffect && (
                  <UpcastingInput
                    upcast={delivery?.upcast}
                    onUpdateUpcast={onUpdateUpcast}
                  />
                )}

                {/* MANA DISCOUNT INPUT */}
                <ManaDiscount
                  discount={delivery?.discount}
                  onUpdateDiscount={onUpdateDiscount}
                />

                {/* SPELL EFFECT AND FOCUS TOGGLES */}
                <div className="flex-col ml-auto">
                  <SpellEffectToggle
                    isEffect={delivery?.applyEffect}
                    onSpellEffectToggle={onToggleSpellEffect}
                  />
                  <SpellFocusToggle
                    isFocused={delivery?.isFocused}
                    onToggleSpellFocus={onToggleSpellFocus}
                  />
                </div>

                <TotalMana cost={delivery?.manaCost ?? 0} />
              </div>
            </div>

            {/* Insufficient mana error message */}
            <div className="flex ml-auto">
              <SpellcastingErrMsg
                cost={delivery?.manaCost ?? 0}
                mana={hero.mana.value}
                maxCast={hero.mana.maxCast}
              />
            </div>

            {/* User-help description of the chosen delivery */}
            <SpellcastingSubtext text={delivery?.description ?? ""} />
          </div>
        )}
      </>
    )
  }

  return {
    isSpellcastingOpen,
    setIsSpellcastingOpen,
    onSelectSpell,
    selectedSpellId,
    SpellcastingMenu,
  }
}
