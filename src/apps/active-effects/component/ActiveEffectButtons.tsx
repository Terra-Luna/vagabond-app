import { ToggleLeft, ToggleRight } from "lucide-react"

import { appLang } from "../../../util/lang"
import { TrashButton } from "../../../view/component/TrashButton"

export const ActiveEffectButtons = ({
  effect,
  onToggle,
  onDelete,
  showToggle = true,
}: {
  effect: any
  onToggle: () => void
  onDelete: () => void
  showToggle?: boolean
}) => {
  return (
    <div className="flex items-center pr-1">
      {/* ITEM EFFECT SUSPENDED LABLE */}
      {effect.isTransfer && effect.suspended && (
        <p>{appLang.Effects.suspended}</p>
      )}

      {/* EFFECT TOGGLE SWITCH */}
      {showToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="rounded hover-glow cursor-pointer transition-colors"
          title={
            effect.disabled
              ? appLang.ButtonActions.enable
              : appLang.ButtonActions.disable
          }
        >
          {effect.disabled ? (
            <ToggleLeft
              size={24}
              className="w-6 h-6 text-text-header-secondary"
            />
          ) : (
            <ToggleRight size={24} className="w-6 h-6 text-ic-luck" />
          )}
        </button>
      )}

      {/* DELETE BUTTON */}
      <div className={showToggle ? "ml-2" : ""}>
        <TrashButton
          onClick={(e) => {
            e?.stopPropagation()
            onDelete()
          }}
        />
      </div>
    </div>
  )
}
