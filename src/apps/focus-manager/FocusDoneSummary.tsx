import type { ReactNode } from "react"

import { FocusUpkeep } from "../../combat/spellcasting/FocusUpkeep"
import type { FocusInstance } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { DamageTypeIcon } from "../../view/component/DamageTypeIcon"

/** One-line recap of a resolved Focus, including damage repeated this round. */
export const FocusDoneSummary = ({
  round,
  instance,
  spellCard,
}: {
  round: number
  instance: FocusInstance
  spellCard: ReactNode
}) => {
  const spellItem = fromUuidSync(instance.spell as any) as any
  const repeated =
    instance.repeatKey === FocusUpkeep.roundKey(round)
      ? (instance.repeatDamage ?? 0)
      : 0

  return (
    <div className="flex gap-x-1 items-center">
      {spellCard}
      <span className="shrink-0 ml-auto flex items-center gap-x-1 text-base text-text-primary pr-1">
        {repeated > 0
          ? `${appLang.Spellcasting.focusSummaryFocused}:`
          : appLang.Spellcasting.focusSummaryFocused}
        {repeated > 0 && (
          <>
            <span>{repeated}</span>
            <DamageTypeIcon dmgType={spellItem?.system?.damageType} size={18} />
          </>
        )}
      </span>
    </div>
  )
}
