import type { ReactNode } from "react"
import { useState } from "react"

import { FocusUpkeep } from "../../combat/spellcasting/FocusUpkeep"
import type { FocusInstance } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { DestructiveButton, PrimaryButton } from "../../view/component/Button"
import { SingleSelect } from "../../view/component/SingleSelect"
import { EditModeContext } from "../../view/context/EditModeContext/Hooks"
import { useBusy } from "./useBusy"

type FavorSource = "none" | "luck" | "studied"

const alwaysEditing = {
  isEditMode: true,
  setEditMode: () => {},
  toggleEditMode: () => {},
  editModeToggleBtn: null,
}

/** Step one of a round: pay the mana and attempt the Cast check, or let the Focus go. */
export const UpkeepPanel = ({
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
  const { busy, run } = useBusy()
  const [favorWith, setFavorWith] = useState<FavorSource>("none")
  const { luck = 0, studied = 0 } = hero.system.statuses?.counters ?? {}
  const needsCheck = FocusUpkeep.needsCheck(hero, instance)
  const affordable = FocusUpkeep.canAfford(hero, instance)

  const pay = (e?: React.MouseEvent) =>
    run(() =>
      FocusUpkeep.pay(
        hero,
        instance.id,
        round,
        favorWith === "none" ? undefined : favorWith,
        e?.shiftKey ? "favor" : e?.ctrlKey ? "hinder" : undefined,
      ),
    )

  const decline = async () => {
    await FocusUpkeep.decline(hero, instance.id)
    onDone()
  }

  const favorOptions = [
    { value: "none", label: appLang.Spellcasting.focusFavorNone },
    ...(luck > 0
      ? [{ value: "luck", label: appLang.Spellcasting.focusFavorLuck }]
      : []),
    ...(studied > 0
      ? [{ value: "studied", label: appLang.Spellcasting.focusFavorStudy }]
      : []),
  ]

  return (
    <>
      <div className="flex flex-wrap gap-1 items-center">
        {spellCard}
        <div className="flex flex-wrap gap-1 ml-auto">
          <PrimaryButton onClick={pay} disabled={busy || !affordable}>
            {affordable
              ? appLang.Spellcasting.focusUpkeepPay
              : appLang.Spellcasting.focusUpkeepInsufficientMana}
          </PrimaryButton>
          <DestructiveButton hideIcon onClick={decline}>
            {appLang.Spellcasting.focusUpkeepDrop}
          </DestructiveButton>
        </div>
      </div>
      {(luck > 0 || studied > 0) && needsCheck && (
        <div className="flex items-center justify-center gap-x-2 text-sm my-1">
          <span>{appLang.Spellcasting.focusFavorLabel}</span>
          <EditModeContext.Provider value={alwaysEditing}>
            <SingleSelect
              value={favorWith}
              setValue={setFavorWith}
              options={favorOptions}
            />
          </EditModeContext.Provider>
        </div>
      )}
    </>
  )
}
