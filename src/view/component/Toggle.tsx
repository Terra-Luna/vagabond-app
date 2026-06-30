interface SingleSelectProps {
    options: { label: string; value: any }[];
    value: any;
    setValue: (val: any) => void;
}

export const SingleSelect = ({ options, value, setValue }: SingleSelectProps) => {
    const selectedClass = "bg-sheet-header-fill text-text-header-primary border-text-header-primary px-1"
    const unselectedClass = "px-1"

    return (
        <div className="border border-solid p-1 flex gap-1">
            {options.map(opt => {
                const isSelected = opt.value === value
                return (
                    <button className={isSelected ? selectedClass : unselectedClass} title={opt.label} onClick={() => setValue(opt.value)}>{opt.label}</button>
                );
            })}
        </div>
    )
}