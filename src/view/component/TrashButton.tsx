import { Trash } from "lucide-react"

import { Tooltip } from "./Tooltip"

export const TrashButton = ({ title = "Delete", className = "", onDelete }: { title?: string, className?: string, onDelete: (e?) => void }) => {
    return (
        <Tooltip content={title}>
            <button type="button" onClick={onDelete} className={className}>
                <Trash size={18} className={`hover:text-destructive-action/80 transition-colors hover-glow cursor-pointer`} />
            </button>
        </Tooltip>
    )
}