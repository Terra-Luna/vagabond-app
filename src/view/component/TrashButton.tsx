import { Trash } from "lucide-react"

export const TrashButton = ({ title = "Delete", onDelete }: { title?: string, onDelete: () => void }) => {
    return (
        <button type="button" title={title} onClick={onDelete}>
            <Trash size={18} className="hover:text-destructive-action/80 transition-colors hover-glow cursor-pointer" />
        </button>
    )
}