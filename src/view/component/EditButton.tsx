import { SquarePen } from "lucide-react"

import { appLang } from "../../utils/lang"

export const EditButton = ({ onEdit }: { onEdit: () => void }) => {
    return (
        <button type="button" title={appLang.ButtonActions.edit} onClick={onEdit} className="focus:outline-none">
            <SquarePen size={18} className="hover:text-text-header-tertiary transition-colors hover-glow cursor-pointer" />
        </button>
    )
}