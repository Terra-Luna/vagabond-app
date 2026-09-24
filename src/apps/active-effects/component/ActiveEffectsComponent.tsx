import { Pencil, Trash } from "lucide-react"

import { appLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { UtilityButton } from "../../../view/component/Button"
import { useContextMenu } from "../../../view/component/ContextMenu"
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
        <div className={`flex flex-col gap-1 px-1 pt-1 h-full bg-sheet-main-fill text-text-primary font-eskapade font-bold rounded-sm`}>
            {/* Header / Add Button */}
            <div className="flex justify-between items-center">
                <p className="text-lg">{appLang.Effects.title}</p>
                <UtilityButton children={appLang.ButtonActions.addEffect} onClick={onCreate} />
            </div>

            {/* 🔥 BURNING NOTIFICATIONS 🔥 */}
            {effects.filter(eff => eff.name.includes("burning")).map((eff) => (
                <div
                    key={eff.id}
                    onClick={() => onEdit(eff.id)}
                    className="flex items-center justify-between bg-context-menu-fill border border-solid border-destructive-action/50 rounded p-2 text-text-primary text-sm"
                >
                    <span className="flex items-center gap-1.5 text-lg">
                        <span>🔥</span> {appLang.Effects.burn}:
                        <span className="text-text-header-tertiary italic ml-1 text-sm line-clamp-1">
                            {`(${appLang.Effects.by} ${eff.sourceName || appLang.Effects.env})`}
                        </span>
                    </span>
                    <div className="flex gap-x-4">
                        <ActiveEffectButtons
                            effect={eff}
                            onToggle={() => onToggle(eff.id)}
                        />
                        <span className="bg-sheet-main-fill px-2 py-0.5 rounded-sm border border-solid border-destructive-action/50 text-text-secondary text-lg">
                            Cd{eff.duration?.toString()}
                        </span>
                    </div>
                </div>
            ))}

            {/* EFFECTS LIST */}
            <ul className="flex flex-col gap-1 overflow-y-auto pr-1">
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
                        <ActiveEffectButtons effect={eff} onToggle={() => onToggle(eff.id)} />
                    </li>
                ))}
            </ul>

            <ContextMenu />

        </div>
    )
}