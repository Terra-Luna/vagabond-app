import { ToggleLeft, ToggleRight, Pencil, Trash } from "lucide-react"
import { PrimaryButton } from "../../view/component/Button"

interface Effect {
    id: string
    name: string
    img: string
    disabled: boolean
    isTransfer: boolean // is from equipped gear
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
    console.log("Rendering")
    return (
        <div className="flex flex-col gap-4 p-4 h-full bg-sheet-main-fill text-text-primary font-eskapade font-bold">
            {/* Header / Add Button */}
            <div className="flex justify-between items-center">
                <p className="text-2xl">Active Effects</p>
                <PrimaryButton children={"Add Effect"} onClick={onCreate} />
            </div>

            {/* EFFECTS LIST */}
            <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
                {effects.map((effect) => (
                    <li
                        key={effect.id}
                        className={`
                            flex items-center justify-between p-2
                            text-xl text-text-header-primary transition-all 
                            bg-sheet-header-fill border border-solid border-table-border rounded-md
                            ${effect.disabled ? 'opacity-50' : ''}
                        `}
                    >
                        {/* ICON & NAME */}
                        <div className="flex items-center gap-3">
                            <img
                                src={effect.img}
                                alt={effect.name}
                                className={`w-8 h-8 rounded object-cover`}
                            />
                            <span className={`${effect.disabled ? 'line-through' : ''}`}>
                                {effect.name}
                            </span>
                            {effect.isTransfer && (
                                <span className="text-[10px] bg-text-header-tertiary text-text-header-tertiary px-1.5 py-0.5 rounded uppercase">
                                    Item
                                </span>
                            )}
                        </div>

                        {/* CONTROLS */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onToggle(effect.id)}
                                className="p-1.5 rounded hover:hover:bg-slate-700 transition-colors"
                                title={effect.disabled ? "Enable" : "Disable"}
                            >
                                {effect.disabled ? (
                                    <ToggleLeft size={24} className="w-5 h-5 text-text-header-secondary" />
                                ) : (
                                    <ToggleRight size={24} className="w-5 h-5 text-ic-luck" />
                                )}
                            </button>

                            {!effect.isTransfer && (
                                <>
                                    <button
                                        onClick={() => onEdit(effect.id)}
                                        className="p-1.5 rounded text-sky-400 hover:bg-slate-700 transition-colors"
                                        title="Edit Effect"
                                    >
                                        <Pencil size={24} className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(effect.id)}
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