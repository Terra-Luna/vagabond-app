import { ReactNode, useCallback } from "react"

import { useEditMode } from "../context/EditModeContext/Hooks"

interface SingleSelectProps {
    options: { label: string | ReactNode, value: any }[]
    value: any
    setValue: (val: any) => void
    canUnselect?: boolean
}

export const SingleSelect = ({ options, value, setValue, canUnselect }: SingleSelectProps) => {
    const { isEditMode } = useEditMode()
    const selectedClass = `text-text-header-secondary border-text-header-primary rounded-sm px-1 ${isEditMode && canUnselect ? 'cursor-pointer' : ''}`
    const unselectedClass = `bg-sheet-main-fill px-1 ${isEditMode ? 'cursor-pointer' : ''}`

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
        <div className="bg-sheet-header-fill border border-solid border-table-border rounded-sm px-0.5 flex gap-1">
            {options.map(opt => {
                const isSelected = opt.value === value
                return (
                    <button
                        key={opt.value}
                        className={isSelected ? selectedClass : unselectedClass}
                        onClick={isEditMode ? () => handleOptClick(opt.value) : undefined}
                    >
                        {opt.label}
                    </button>
                )
            })}
        </div>
    )
}