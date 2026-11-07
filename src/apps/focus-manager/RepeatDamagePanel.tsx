import { Dices } from "lucide-react"
import { type ReactNode, useMemo, useState } from "react"

import { FocusAreaExposure } from "../../combat/spellcasting/FocusAreaExposure"
import { FocusUpkeep } from "../../combat/spellcasting/FocusUpkeep"
import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { localizeString } from "../../util/locale-util"
import { toTargetDisplayItems } from "../../util/model-util"
import { TargetsDisplay } from "../../view/chat/component/TargetsDisplay"
import { useTargetSync } from "../../view/chat/component/TargetSyncUseCase"
import { tableBorder } from "../../view/common/border-styles"
import { PrimaryButton, SecondaryButton, UtilityButton } from "../../view/component/Button"

/** Optional step after upkeep: repeat the Focused spell's damage at 1 mana per die. */
export const RepeatDamagePanel = ({
  hero,
  round,
  instance,
  spellCard,
  onDone,
}: {
  hero: Actor & { system: any }
  round: number
  instance: FocusInstance
  spellCard: ReactNode
  onDone: () => void
}) => {
  const snapshot = instance.delivery!
  const isArea = !!snapshot.isArea
  const placedArea = FocusAreaExposure.hasArea(instance)
  const maxDice = Math.max(1, FocusUpkeep.maxDice(hero))
  const [dice, setDice] = useState(1)
  const live = useTargetSync()
  const original = useMemo(
    () => toTargetDisplayItems(instance.targetIds ?? []),
    [instance.targetIds],
  )
  // A placed area always hits the Hostiles inside this spell's own area right now.
  const inArea = useMemo(
    () =>
      toTargetDisplayItems(
        FocusAreaExposure.targetsIn(instance).map((t) => t.id as string),
      ),
    [instance],
  )
  const targets = placedArea
    ? live.length
      ? live
      : inArea
    : isArea
      ? live
      : original
  const [sending, setSending] = useState(false)
  const canDeal =
    !sending &&
    FocusUpkeep.maxDice(hero) >= 1 &&
    (placedArea || targets.length > 0)

  const setCanvasTargets = (tokens: any[]) =>
    tokens.forEach((token, i) =>
      token.setTarget?.(true, { releaseOthers: i === 0, groupSelection: true }),
    )

  const reselectOriginal = () =>
    setCanvasTargets(original.map((it) => it.token))

  const targetInArea = () =>
    setCanvasTargets(FocusAreaExposure.targetsIn(instance))

  /** Ids to damage for a placed area, or undefined (after telling the user) when the selection is invalid. */
  const resolveAreaTargets = (): string[] | undefined => {
    if (!live.length) {
      if (inArea.length) return inArea.map((t) => t.id)
      ui.notifications?.error(appLang.Spellcasting.focusRepeatSelectInArea)
      return undefined
    }
    const inside = new Set(
      FocusAreaExposure.occupantsOf(instance).map((t) => t.id as string),
    )
    if (live.some((t) => !inside.has(t.id))) {
      ui.notifications?.warn(appLang.Spellcasting.focusRepeatOutsideArea)
      return undefined
    }
    return live.map((t) => t.id)
  }

  const reopen = () =>
    FocusSpellUtil.update(hero, instance.id, {
      doneKey: undefined,
      repeatDamage: undefined,
      repeatKey: undefined,
    })

  const abandon = async () => {
    setSending(false)
    await reopen()
  }

  const cast = async () => {
    if (sending) return
    const areaIds = placedArea ? resolveAreaTargets() : undefined
    if (placedArea && !areaIds) return
    setSending(true)
    // Advance right away: the attack can take a while (prompts, chat card), and the step is spent once started.
    await onDone()
    try {
      const total = await FocusUpkeep.dealDamage(
        hero,
        instance,
        dice,
        areaIds ?? targets.map((t) => t.id),
      )
      if (total === undefined) return abandon()
      await FocusSpellUtil.update(hero, instance.id, {
        repeatDamage: total,
        repeatKey: FocusUpkeep.roundKey(round),
      })
    }
    catch (e) {
      console.error("Focus repeat damage failed", e)
      ui.notifications?.error(
        `${appLang.Spellcasting.focusRepeatFailed}: ${(e as Error)?.message ?? e}`,
      )
      await abandon()
    }
  }

  return (
    <div className="flex flex-col gap-y-1 items-center text-text-primary">
      <div className="flex items-center justify-between w-full gap-x-2">
        {spellCard}
        <label className="flex items-center gap-x-2">
          <Dices size={24} className="text-text-header-tertiary" />
          <input
            type="number"
            min={1}
            max={maxDice}
            value={dice}
            onChange={(e) =>
              setDice(
                Math.max(1, Math.min(Number(e.target.value) || 1, maxDice)),
              )
            }
            className={`${tableBorder} font-eskapade font-bold text-xl px-2 py-1 w-[6ch]`}
          />
          <span className="text-base">
            {localizeString(appLang.Spellcasting.focusRepeatCost, {
              mana: String(dice),
            })}
          </span>
        </label>
      </div>
      <span className="text-text-primary w-full">
        <TargetsDisplay targets={targets} />
      </span>
      {placedArea && FocusAreaExposure.autoPref(instance) && (
        <UtilityButton onClick={targetInArea}>
          {FocusAreaExposure.isFriendly(instance)
            ? appLang.Spellcasting.focusRepeatTargetAreaFriendly
            : FocusAreaExposure.autoPref(instance) === "all"
              ? appLang.Spellcasting.focusRepeatTargetAreaAll
              : appLang.Spellcasting.focusRepeatTargetArea}
        </UtilityButton>
      )}
      {isArea && !placedArea && original.length > 0 && (
        <UtilityButton onClick={reselectOriginal}>
          {appLang.Spellcasting.focusRepeatReuseTargets}
        </UtilityButton>
      )}
      <div className="flex gap-x-1">
        <PrimaryButton onClick={cast} disabled={!canDeal}>
          {snapshot.spell.damageType === "healing"
            ? appLang.Spellcasting.focusRepeatConfirmHealing
            : appLang.Spellcasting.focusRepeatConfirm}
        </PrimaryButton>
        <SecondaryButton onClick={onDone}>
          {appLang.Spellcasting.focusRepeatSkip}
        </SecondaryButton>
      </div>
    </div>
  )
}
