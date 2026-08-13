import { Dices } from "lucide-react"

export const RollButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button type="button" title="Attack" onClick={onClick}>
            <Dices size={18} className="mt-1 hover:text-text-header-tertiary transition-colors hover-glow cursor-pointer" />
        </button>
    )
}