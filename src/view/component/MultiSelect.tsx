import { KeyboardEvent, useRef, useState } from 'react'
import Select, { ClassNamesConfig, MultiValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { useEditMode } from '../context/EditModeContext/Hooks'

export interface SelectOption { label: string, value: string }

interface MultiSelectProps {
    options?: SelectOption[]
    value: SelectOption[]
    handleOnChange: (value: MultiValue<SelectOption>) => void
    placeholder?: string
    isValidNewOption?: (input: string) => boolean
}

/**
 * "ClassNamesConfig" documentation: https://react-select.com/props
 */
const selectClassNames: ClassNamesConfig<SelectOption, true> = {
    control: (state) => `bg-context-menu-fill text-context-menu-text border rounded px-1 min-h-9 ${state.isFocused ? "border-table-border" : "border-table-border/50"}`,
    valueContainer: () => "flex flex-wrap gap-1 p-1",
    menu: () => "bg-context-menu-fill text-context-menu-text border border-table-border rounded mt-1 z-99",
    menuList: () => "max-h-60 overflow-y-auto",
    option: (state) => `px-2 py-1 cursor-pointer text-context-menu-text ${state.isFocused ? "bg-context-menu-text/20" : "bg-context-menu-fill"}`,
    noOptionsMessage: () => "px-2 py-1 text-context-menu-text/60",
    input: () => "text-context-menu-text",
    placeholder: () => "text-context-menu-text/60",
    multiValue: () => "bg-context-menu-text/20 rounded-sm flex items-center",
    multiValueLabel: () => "text-context-menu-text px-1.5 py-0.5 text-sm",
    multiValueRemove: () => "text-context-menu-text px-1 cursor-pointer hover:bg-destructive-action/60 rounded-r-sm",
    indicatorsContainer: () => "flex items-center gap-1 text-context-menu-text",
    dropdownIndicator: () => "text-context-menu-text px-1 cursor-pointer",
    clearIndicator: () => "text-context-menu-text px-1 cursor-pointer",
    indicatorSeparator: () => "bg-context-menu-text/40 w-px self-stretch my-1"
}

/**
 * Documentation: https://react-select.com/props
 * Examples: https://react-select.com/creatable
 */
export const MultiSelect = ({ options = [], value = [], handleOnChange, placeholder, isValidNewOption }: MultiSelectProps) => {
    const { isEditMode } = useEditMode()
    const [inputValue, setInputValue] = useState("")
    const selectRef = useRef<any>(null)

    /**
     * Explicit key-handling for tab/enter events. This prevents them from closing the menu, cancelling, or tabbing off.
     * @param e 
     * @returns 
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (e.key !== "Tab" && e.key !== "Enter") return

        const typed = inputValue.trim()
        if (!typed) return

        const selected = new Set(value.map(v => v.value))
        const focused = selectRef.current?.state?.focusedOption as (SelectOption & { __isNew__?: boolean }) | undefined
        const matches = options.filter(o => !selected.has(o.value) && o.label.toLowerCase().includes(typed.toLowerCase()))
        const pick = focused && !selected.has(focused.value)
            ? { label: focused.label, value: focused.value }
            : (matches.find(o => o.value === typed) ?? matches[0] ?? (isValidNewOption?.(typed) ? { label: typed, value: typed } : undefined))

        if (!pick) return
        e.preventDefault()
        e.stopPropagation()
        handleOnChange([...value, { label: pick.label, value: pick.value }])
        setInputValue("")
    }

    const commonProps = {
        options,
        value,
        isMulti: true as const,
        placeholder,
        inputValue,
        onInputChange: (input: string, meta: { action: string }) => {
            if (meta.action === "input-change") setInputValue(input)
            else if (meta.action === "set-value" || meta.action === "menu-close" || meta.action === "input-blur") setInputValue("")
        },
        onKeyDown: handleKeyDown,
        onChange: handleOnChange,
        openMenuOnFocus: true,
        unstyled: true as const,
        classNames: selectClassNames
    }

    return (<>
        {isEditMode
            ? (isValidNewOption
                ? <CreatableSelect
                    {...commonProps}
                    ref={selectRef}
                    isValidNewOption={(input) => {
                        const trimmed = input.trim()
                        return trimmed.length > 0 && !options.some(o => o.value === trimmed) && isValidNewOption(trimmed)
                    }}
                    formatCreateLabel={(input) => `Use "${input.trim()}"`}
                />
                : <Select {...commonProps} ref={selectRef} />)
            : <p className="text-lg text-text-primary bg-sheet-main-fill">
                {value.length > 0
                    ? value.map(o => o.label).join(", ")
                    : "None"
                }
            </p>
        }
    </>)
}