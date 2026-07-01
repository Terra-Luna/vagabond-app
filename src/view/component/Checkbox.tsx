import { LucideCheckSquare, LucideSquare } from "lucide-react"
import { sheetPropLabel } from "../common/text-styles"

interface CheckboxProps {
    label: string
    onCheckedChanged: (checked: boolean) => void
    checked: boolean,
    inverted?: boolean,
    isGlobalEditMode?: boolean
}

export const Checkbox = ({ label, onCheckedChanged, checked, inverted = false, isGlobalEditMode = true }: CheckboxProps) => (
    <label
        className={`flex items-center gap-1 ${sheetPropLabel} ${isGlobalEditMode ? "cursor-pointer" : ""}`}
        onClick={() => {
            if (isGlobalEditMode) {
                onCheckedChanged(!checked)
            }
        }}
    >{
            inverted ? <>
                <span>{label}</span>
                <Box checked={checked} />
            </> : <>
                <Box checked={checked} />
                <span>{label}</span>
            </>
        }
    </label>
)

const Box = ({ checked }) => {
    return (
        <span aria-hidden="true">
            {checked ?
                <LucideCheckSquare className="text-stat-block-fill" size={18} /> :
                <LucideSquare className="text-stat-block-fill" size={18} />
            }
        </span>
    )
}