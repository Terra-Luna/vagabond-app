import { Pencil, ToggleLeft, ToggleRight, Trash } from "lucide-react"

export const ActiveEffectButtons = ({ effect, onToggle, onEdit, onDelete }) => {
    return (
        <div className="flex items-center gap-2">

            {/* ITEM EFFECT SUSPENDED LABLE */}
            {effect.isTransfer && ( effect.suspended && <p>Suspended</p> )}

            {/* EFFECT TOGGLE SWITCH */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onToggle(effect.id)
                }}
                className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                title={effect.disabled ? "Enable" : "Disable"}
            >
                {effect.disabled ? (
                    <ToggleLeft size={24} className="w-5 h-5 text-text-header-secondary" />
                ) : (
                    <ToggleRight size={24} className="w-5 h-5 text-ic-luck" />
                )}
            </button>

            {/* EDIT BUTTON */}
            <button
                onClick={() => onEdit(effect.id)}
                className="p-1.5 rounded text-sky-400 hover:bg-slate-700 transition-colors"
                title="Edit Effect"
            >
                <Pencil size={24} className="w-4 h-4" />
            </button>

            {/* DELETE BUTTON */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(effect.id)
                }}
                className="p-1.5 rounded text-destructive-action hover:bg-slate-700 transition-colors"
                title="Delete Effect"
            >
                <Trash size={24} className="w-4 h-4" />
            </button>
        </div>
    )
}