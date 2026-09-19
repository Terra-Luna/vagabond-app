import { Trash } from "lucide-react"

import { Tooltip } from "./Tooltip"

export const TrashButton = ({ title = "Delete", className = "", onClick }: { title?: string, className?: string, onClick: (e?) => void }) => {
    return (
        <Tooltip content={title}>
            <button type="button" onClick={onClick} className={className}>
                <Trash size={18} className={`hover:text-destructive-action/80 transition-colors hover-glow cursor-pointer mt-1`} />
            </button>
        </Tooltip>
    )
}