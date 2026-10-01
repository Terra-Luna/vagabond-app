import { ChangeEvent, useEffect, useRef, useState } from "react"

import { tableBorderRounded } from "../../view/common/border-styles"
import { ItemRulesLabel } from "./ItemRulesTypography"

export const ItemRuleInput = ({ label, value, placeholder = '', onChange, type = 'text' }) => {
    const [localValue, setLocalValue] = useState(value)
    const pendingChange = useRef<ChangeEvent<HTMLInputElement> | null>(null)
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    const flushPendingChange = () => {
        if (saveTimeout.current !== null) {
            clearTimeout(saveTimeout.current)
            saveTimeout.current = null
        }
        if (pendingChange.current !== null) {
            onChangeRef.current(pendingChange.current)
            pendingChange.current = null
        }
    }

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    useEffect(() => () => {
        if (saveTimeout.current !== null) clearTimeout(saveTimeout.current)
        if (pendingChange.current !== null) onChangeRef.current(pendingChange.current)
    }, [])

    const handleInputChange = (e) => {
        setLocalValue(e.target.value)
        pendingChange.current = e
        if (saveTimeout.current !== null) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(flushPendingChange, 300)
    }

    return (<>
        {
            <div className="flex flex-col gap-2">
                <ItemRulesLabel text={label} />
                <input
                    type={type}
                    value={localValue}
                    onChange={handleInputChange}
                    onBlur={flushPendingChange}
                    style={type === 'number' ? { maxWidth: '8ch' } : undefined}
                    className={`
                        ${tableBorderRounded}
                        px-2 py-1 -mt-2
                        text-sm text-white 
                        focus:border-table-border 
                        focus:outline-none 
                    `}
                    placeholder={placeholder}
                />
            </div>
        }
    </>)
}

export const ItemRuleSelector = ({ label, value, options, onChange }) => {
    return (
        <div className="flex flex-col">
            <label className="text-base text-text-primary font-eskapade font-bold">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e)}
                className={`${tableBorderRounded} text-text-primary bg-sheet-main-fill p-1`}
            >
                {options}
            </select>
        </div>
    )
}