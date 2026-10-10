import { Trash } from "lucide-react"

import { appLang } from "../../utils/lang"
import { Tooltip } from "./Tooltip"

export const TrashButton = ({ title = appLang.ButtonActions.delete, className = "", onClick }: { title?: string, className?: string, onClick: (e?) => void }) => {
    return (
        <Tooltip content={title}>
            <button type="button" onClick={onClick} className={className}>
                <Trash size={18} className={`hover:text-destructive-action/80 transition-colors hover-glow cursor-pointer mt-1`} />
            </button>
        </Tooltip>
    )
}