import { Dices } from "lucide-react"
import { useMemo, useState } from "react"

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
  onDone,
}: {
  hero: Actor & { system: any }
  round: number
  instance: FocusInstance
  onDone: () => void
}) => {
  const snapshot = instance.delivery!
  const isArea = !!snapshot.isArea
  const maxDice = Math.max(1, FocusUpkeep.maxDice(hero))
  const [dice, setDice] = useState(
    Math.max(1, Math.min(snapshot.damageDice ?? 1, maxDice)),
  )
  const live = useTargetSync()
  const original = useMemo(
    () => toTargetDisplayItems(instance.targetIds ?? []),
    [instance.targetIds],
  )
  const targets = isArea ? live : original
  const [sending, setSending] = useState(false)
  const canDeal =
    !sending && FocusUpkeep.maxDice(hero) >= 1 && targets.length > 0

  const reselectOriginal = () =>
    original.forEach((it, i) =>
      (it.token as any)?.setTarget(true, {
        releaseOthers: i === 0,
        groupSelection: true,
      }),
    )

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
    setSending(true)
    // Advance right away: the attack can take a while (prompts, chat card), and the step is spent once started.
    await onDone()
    try {
      const total = await FocusUpkeep.dealDamage(
        hero,
        instance,
        dice,
        targets.map((t) => t.id),
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
      <p className="text-center text-sm">
        {localizeString(
          isArea
            ? appLang.Spellcasting.focusRepeatAreaDescription
            : appLang.Spellcasting.focusRepeatDescription,
          { spell: snapshot.spell.name },
        )}
      </p>
      <label className="flex items-center gap-x-2">
        <Dices size={24} className="text-text-header-tertiary" />
        <input
          type="number"
          min={1}
          max={maxDice}
          value={dice}
          onChange={(e) =>
            setDice(Math.max(1, Math.min(Number(e.target.value) || 1, maxDice)))
          }
          className={`${tableBorder} font-eskapade font-bold text-xl px-2 py-1 w-[6ch]`}
        />
        <span className="text-base">
          {localizeString(appLang.Spellcasting.focusRepeatCost, {
            mana: String(dice),
          })}
        </span>
      </label>
      <span className="text-text-primary w-full">
        <TargetsDisplay targets={targets} />
      </span>
      {isArea && original.length > 0 && (
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
