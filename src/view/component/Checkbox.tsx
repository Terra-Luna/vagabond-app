import { LucideCheckSquare, LucideSquare } from "lucide-react"

interface CheckboxProps {
    label: string
    onCheckedChanged: (checked: boolean) => void
    checked: boolean,
    isGlobalEditMode?: true
}

export const Checkbox = ({ label, onCheckedChanged, checked, isGlobalEditMode }: CheckboxProps) => (
    <label className="flex items-center gap-1" onClick={() => {
        if (isGlobalEditMode) {
            onCheckedChanged(!checked)
        }
    }}>
        <span aria-hidden="true">
            {checked ? <LucideCheckSquare /> : <LucideSquare />}
        </span>
        <span>{label}</span>
    </label>
)