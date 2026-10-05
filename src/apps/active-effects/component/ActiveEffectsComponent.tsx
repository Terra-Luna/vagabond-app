import { Pencil, Trash } from "lucide-react"

import { appLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { UtilityButton } from "../../../view/component/Button"
import { useContextMenu } from "../../../view/component/ContextMenu"
import { DynamicGrid } from "../../../view/component/DynamicGrid"
import { ActiveEffectButtons } from "./ActiveEffectButtons"

export interface Effect {
    id: string
    statusId: string
    name: string
    img: string
    disabled: boolean
    isTransfer: boolean // is from equipped gear
    duration?: number // (Cd4, etc...)
    sourceName?: string
    changes?: any[] // list of changes applied by this effect
}

interface EffectsTabProps {
    effects: Effect[]
    onCreate: () => void
    onToggle: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export const ActiveEffectsComponent: React.FC<EffectsTabProps> = ({
    effects,
    onCreate,
    onToggle,
    onEdit,
    onDelete
}) => {

    const { ContextMenu, onCtxMenu } = useContextMenu()

    return (
        <div className={`flex flex-col gap-1 h-full text-text-primary font-eskapade font-bold rounded-sm`}>
            {/* Header / Add Button */}
            <div className="flex justify-between items-center">
                <p className="text-lg">{appLang.Effects.title}</p>
                <UtilityButton children={appLang.ButtonActions.addEffect} onClick={onCreate} />
            </div>

            {/* EFFECTS LIST */}
            <DynamicGrid>
                {effects.filter(eff => !eff.name.includes("burning")).map((eff) => (
                    <li
                        key={eff.id}
                        onClick={() => onEdit(eff.id)}
                        onContextMenu={(e) => onCtxMenu(e, [
                            { icon: Pencil, label: appLang.ButtonActions.edit, action: () => onEdit(eff.id) },
                            { icon: Trash, label: appLang.ButtonActions.delete, action: () => onDelete(eff.id), isDestructive: true }
                        ])}
                        className={`
                            flex items-center justify-between pl-2
                            text-base text-text-header-primary font-normal transition-all 
                            bg-sheet-header-fill ${tableBorderRounded}
                            ${eff.disabled ? 'opacity-50' : ''}
                        `}
                    >
                        {/* ICON & NAME */}
                        <div className="flex items-center gap-2">
                            <img
                                src={eff.img}
                                alt={eff.name}
                                className={`w-4 h-4 rounded object-cover`}
                            />
                            <span className={`${eff.disabled ? 'line-through' : ''}`}>
                                {eff.name}
                            </span>
                        </div>

                        {/* TOGGLE SWITCH */}
                        {eff.changes && eff.changes.length > 0 && <ActiveEffectButtons effect={eff} onToggle={() => onToggle(eff.id)} />}
                    </li>
                ))}
            </DynamicGrid>

            <ContextMenu />

        </div>
    )
}