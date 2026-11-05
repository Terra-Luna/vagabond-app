import { BookMarked, Clover } from "lucide-react"

import { FocusUpkeep } from "../../combat/spellcasting/FocusUpkeep"
import { InteractiveChatCardButton } from "../../combat/ui/chat/InteractiveChatCardButton"
import type { FocusInstance } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { DestructiveButton } from "../../view/component/Button"
import { useBusy } from "./useBusy"

const luckBorder = "border-2 border-solid border-ic-luck/66"
const studiedBorder = "border-2 border-solid border-ic-studied/66"

/** After a failed Cast check: spend Luck or a Studied die to rescue it, or accept the Focus ending. */
export const FailedCheckPanel = ({
  hero,
  round,
  instance,
}: {
  hero: Actor & { system: any }
  round: number
  instance: FocusInstance
}) => {
  const { busy, run } = useBusy()
  const { luck = 0, studied = 0 } = hero.system.statuses?.counters ?? {}
  const canRescue = FocusUpkeep.canRescue(hero, instance.id)
  const canLateFavor = FocusUpkeep.canLateFavor(hero, instance.id)

  const guarded = (fn: () => Promise<unknown>) => () => !busy && run(fn)

  return (
    <>
      <p className="text-center text-sm text-text-primary">
        {canRescue
          ? appLang.Spellcasting.focusCheckFailed
          : appLang.Spellcasting.focusCheckFailedNoRescue}
      </p>
      <div className="grid grid-cols-2 gap-1 w-full items-center text-base font-normal px-1 [&>span]:min-w-0 [&>span:last-child:nth-child(odd)]:col-span-2 [&>span>button]:w-full">
        {luck > 0 && !FocusUpkeep.hasRerolled(instance.id) && (
          <InteractiveChatCardButton
            icon={<Clover size={18} className="text-ic-luck h-full" />}
            label={appLang.ItemSheet.reroll}
            tooltip={appLang.AttackBuilder.spendLuckToReroll}
            borderClassName={luckBorder}
            fn={guarded(() => FocusUpkeep.reroll(hero, instance.id, round))}
          />
        )}
        {canLateFavor && luck > 0 && (
          <InteractiveChatCardButton
            icon={<Clover size={18} className="text-ic-luck h-full" />}
            label={appLang.AttackBuilder.plusFavor}
            tooltip={appLang.AttackBuilder.spendLuckToAddFavor}
            borderClassName={luckBorder}
            fn={guarded(() =>
              FocusUpkeep.addFavor(hero, instance.id, round, "luck"),
            )}
          />
        )}
        {canLateFavor && studied > 0 && (
          <InteractiveChatCardButton
            icon={<BookMarked size={18} className="text-ic-studied h-full" />}
            label={appLang.AttackBuilder.plusFavor}
            tooltip={appLang.AttackBuilder.spendStudyToAddFavor}
            borderClassName={studiedBorder}
            fn={guarded(() =>
              FocusUpkeep.addFavor(hero, instance.id, round, "studied"),
            )}
          />
        )}
      </div>
      <div className="flex gap-1 justify-center">
        <DestructiveButton
          hideIcon
          onClick={() => run(() => FocusUpkeep.failFocus(hero, instance.id))}
        >
          {appLang.Spellcasting.focusAcceptFailure}
        </DestructiveButton>
      </div>
    </>
  )
}
