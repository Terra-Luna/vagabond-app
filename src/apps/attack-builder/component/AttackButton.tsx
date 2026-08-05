import { Sword } from "lucide-react"

export const AttackButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button type="button" title="Attack" onClick={onClick}>
            <Sword size={18} className="hover:text-text-header-tertiary transition-colors hover-glow cursor-pointer" />
        </button>
    )
}