import { SquarePen } from "lucide-react"

export const EditButton = ({ onEdit }: { onEdit: () => void }) => {
    return (
        <button type="button" title="Edit" onClick={onEdit}>
            <SquarePen size={18} className="hover:text-text-header-tertiary transition-colors hover-glow cursor-pointer" />
        </button>
    )
}