import { Trash } from "lucide-react"

export const TrashButton = ({ title = "Delete", className = "", onDelete }: { title?: string, className?: string, onDelete: () => void }) => {
    return (
        <button type="button" title={title} onClick={onDelete} className={className}>
            <Trash size={18} className={`hover:text-destructive-action/80 transition-colors hover-glow cursor-pointer`} />
        </button>
    )
}