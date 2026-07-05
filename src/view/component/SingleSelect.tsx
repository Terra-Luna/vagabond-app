import { useCallback } from "react";
import { useEditMode } from "../context/EditModeContext/Hooks";

interface SingleSelectProps {
    options: { label: string; value: any }[]
    value: any
    setValue: (val: any) => void
    canUnselect?: boolean
}

export const SingleSelect = ({ options, value, setValue, canUnselect }: SingleSelectProps) => {
    const { isEditMode } = useEditMode()
    const selectedClass = `bg-sheet-header-fill text-text-header-primary border-text-header-primary rounded-sm px-1 ${isEditMode && canUnselect ? 'cursor-pointer' : ''}`
    const unselectedClass = `px-1 ${isEditMode ? 'cursor-pointer' : ''}`

    const handleOptClick = useCallback((clickedVal) => {
        if (clickedVal === value) {
            if (canUnselect) {
                setValue(undefined)
            }
        }
        else {
            setValue(clickedVal)
        }
    }, [value, setValue])

    return (
        <div className="border border-solid border-stat-block-fill rounded-sm p-1 flex gap-1">
            {options.map(opt => {
                const isSelected = opt.value === value
                return (
                    <button
                        key={opt.value}
                        className={isSelected ? selectedClass : unselectedClass}
                        title={opt.label}
                        onClick={isEditMode ? () => handleOptClick(opt.value) : undefined}
                    >
                        {opt.label}
                    </button>
                )
            })}
        </div>
    )
}