import { ToggleLeft, ToggleRight } from "lucide-react"

import { appLang } from "../../../utils/lang"

export const ActiveEffectButtons = ({ effect, onToggle }) => {

    return (
        <div className="flex items-center pr-1">

            {/* ITEM EFFECT SUSPENDED LABLE */}
            {effect.isTransfer && ( effect.suspended && <p>{appLang.Effects.suspended}</p> )}

            {/* EFFECT TOGGLE SWITCH */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(effect.id); }}
                className="rounded hover-glow cursor-pointer transition-colors"
                title={effect.disabled ? appLang.ButtonActions.enable : appLang.ButtonActions.disable}
            >
                {effect.disabled
                    ? <ToggleLeft size={24} className="w-6 h-6 text-text-header-secondary" />
                    : <ToggleRight size={24} className="w-6 h-6 text-ic-luck" />
                }
            </button>
        </div>
    )
}