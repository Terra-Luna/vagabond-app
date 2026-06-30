import { useCallback } from "react";

interface SingleSelectProps {
    options: { label: string; value: any }[];
    value: any;
    setValue: (val: any) => void;
    canUnselect?: boolean;
}

export const SingleSelect = ({ options, value, setValue, canUnselect }: SingleSelectProps) => {
    const selectedClass = "bg-sheet-header-fill text-text-header-primary border-text-header-primary px-1"
    const unselectedClass = "px-1"

    const handleOptClick = useCallback((clickedVal) => {
        if (clickedVal === value) {
            if (canUnselect) {
                setValue(undefined);
            }
        }
        else {
            setValue(clickedVal)
        }
    }, [value, setValue])

    return (
        <div className="border border-solid p-1 flex gap-1">
            {options.map(opt => {
                const isSelected = opt.value === value
                return (
                    <button className={isSelected ? selectedClass : unselectedClass} title={opt.label} onClick={() => handleOptClick(opt.value)}>{opt.label}</button>
                );
            })}
        </div>
    )
}