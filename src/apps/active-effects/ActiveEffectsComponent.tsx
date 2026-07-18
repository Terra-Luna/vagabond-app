import { ToggleLeft, ToggleRight, Pencil, Trash } from "lucide-react"
import { PrimaryButton } from "../../view/component/Button"
import { vgLiteLang } from "../../utils/lang"

export interface Effect {
    id: string
    statusId: string
    name: string
    img: string
    disabled: boolean
    isTransfer: boolean // is from equipped gear
    duration?: string // this is specifically for burning (Cd4, etc...)
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
    return (
        <div className="flex flex-col gap-4 p-4 h-full bg-sheet-main-fill text-text-primary font-eskapade font-bold rounded-b-lg">
            {/* Header / Add Button */}
            <div className="flex justify-between items-center">
                <p className="text-2xl">{vgLiteLang.Effects.title}</p>
                <PrimaryButton children={vgLiteLang.ButtonActions.addEffect} onClick={onCreate} />
            </div>

            {/* 🔥 BURNING NOTIFICATIONS 🔥 */}
            {effects.filter(eff => eff.name.includes("burning")).map((eff) => (
                <div
                    key={eff.id}
                    onClick={() => onEdit(eff.id)}
                    className="flex items-center justify-between bg-context-menu-fill border border-solid border-destructive-action/50 rounded p-2 text-text-primary text-sm"
                >
                    <span className="flex items-center gap-1.5 text-lg">
                        <span>🔥</span> {vgLiteLang.Effects.burn}:
                        <span className="text-text-header-tertiary italic ml-1 text-sm">
                            {`(${vgLiteLang.Effects.by} ${eff.sourceName || vgLiteLang.Effects.env})`}
                        </span>
                    </span>
                    <span className="bg-sheet-main-fill px-2 py-0.5 rounded-sm border border-solid border-destructive-action/50 text-text-secondary text-lg">
                        {eff.duration || "Cd4"}
                    </span>
                </div>
            ))}

            {/* EFFECTS LIST */}
            <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
                {effects.filter(eff => !eff.name.includes("burning")).map((eff) => (
                    <li
                        key={eff.id}
                        className={`
                            flex items-center justify-between p-2
                            text-xl text-text-header-primary transition-all 
                            bg-sheet-header-fill border border-solid border-table-border rounded-md
                            ${eff.disabled ? 'opacity-50' : ''}
                        `}
                    >
                        {/* ICON & NAME */}
                        <div className="flex items-center gap-3">
                            <img
                                src={eff.img}
                                alt={eff.name}
                                className={`w-8 h-8 rounded object-cover`}
                            />
                            <span className={`${eff.disabled ? 'line-through' : ''}`}>
                                {eff.name}
                            </span>
                            {eff.isTransfer && (
                                <span className="text-[10px] bg-text-header-tertiary text-text-header-tertiary px-1.5 py-0.5 rounded uppercase">
                                    Item
                                </span>
                            )}
                        </div>

                        {/* CONTROLS */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onToggle(eff.id)}
                                className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                                title={eff.disabled ? "Enable" : "Disable"}
                            >
                                {eff.disabled ? (
                                    <ToggleLeft size={24} className="w-5 h-5 text-text-header-secondary" />
                                ) : (
                                    <ToggleRight size={24} className="w-5 h-5 text-ic-luck" />
                                )}
                            </button>

                            {!eff.isTransfer && (
                                <>
                                    <button
                                        onClick={() => onEdit(eff.id)}
                                        className="p-1.5 rounded text-sky-400 hover:bg-slate-700 transition-colors"
                                        title="Edit Effect"
                                    >
                                        <Pencil size={24} className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(eff.id)}
                                        className="p-1.5 rounded text-destructive-action hover:bg-slate-700 transition-colors"
                                        title="Delete Effect"
                                    >
                                        <Trash size={24} className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}