import { LucideCheckSquare, LucideSquare } from "lucide-react"
import { sheetPropLabel } from "../common/text-styles"
import { useEditMode } from "../context/EditModeContext/Hooks"

interface CheckboxProps {
    label: string
    onCheckedChanged: (checked: boolean) => void
    checked: boolean,
    inverted?: boolean,
}

export const Checkbox = ({ label, onCheckedChanged, checked, inverted = false }: CheckboxProps) => {
    const { isEditMode } = useEditMode()
    return (
        <label
            className={`flex items-center gap-1 ${sheetPropLabel} ${isEditMode ? "cursor-pointer" : ""}`}
            onClick={() => {
                if (isEditMode) {
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
    );
}

const Box = ({ checked }) => {
    return (
        <span aria-hidden="true">
            {checked ?
                <LucideCheckSquare className="text-text-header-tertiary" size={18} /> :
                <LucideSquare className="text-text-header-tertiary" size={18} />
            }
        </span>
    )
}