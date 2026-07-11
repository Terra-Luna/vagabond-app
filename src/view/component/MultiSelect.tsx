import Select, { MultiValue } from 'react-select'
import { useEditMode } from '../context/EditModeContext/Hooks'

export interface SelectOption {
    label: string
    value: string
}

interface MultiSelectProps {
    options?: SelectOption[]
    value: SelectOption[]
    handleOnChange: (value: MultiValue<SelectOption>) => void
}

export const MultiSelect = ({ options = [], value = [], handleOnChange }: MultiSelectProps) => {
    const { isEditMode } = useEditMode()
    return (
        <>
            {isEditMode ? (
                <Select
                    options={options}
                    value={value}
                    isMulti
                    onChange={handleOnChange}
                />
            ) : (
                <p className="text-lg">
                    {
                        value.length > 0
                            ? value.map(o => o.label).join(", ")
                            : "None"
                    }
                </p>
            )}
        </>
    )
}