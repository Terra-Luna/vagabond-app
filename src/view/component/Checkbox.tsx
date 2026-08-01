import { LucideCheckSquare, LucideSquare } from "lucide-react"
import { sheetPropLabel } from "../common/text-styles"
import { useEditMode } from "../context/EditModeContext/Hooks"

interface CheckboxProps {
    label: string
    checked: boolean,
    onCheckedChanged: (checked: boolean) => void
    inverted?: boolean,
}

export const Checkbox = ({ label, checked, onCheckedChanged, inverted = false }: CheckboxProps) => {
    const { isEditMode } = useEditMode()
    return (
        <label
            className={`flex items-center ${label.length > 0 ? 'gap-1' : ''} ${sheetPropLabel} ${isEditMode ? "cursor-pointer" : ""}`}
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
                <LucideCheckSquare className="text-text-header-tertiary fill-sheet-main-fill" size={18} /> :
                <LucideSquare className="text-text-header-tertiary fill-sheet-main-fill" size={18} />
            }
        </span>
    )
}