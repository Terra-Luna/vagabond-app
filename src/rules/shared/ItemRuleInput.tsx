import { useEffect, useState } from "react"

import { tableBorder, tableBorderRounded } from "../../view/common/border-styles"
import { ItemRulesLabel } from "./ItemRulesTypography"

export const ItemRuleInput = ({ label, value, placeholder = '', onChange, type = 'text' }) => {
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    const handleInputChange = (e) => {
        setLocalValue(e.target.value)
        onChange(e)
    }

    return (<>
        {
            <div className="flex flex-col gap-2">
                <ItemRulesLabel text={label} />
                <input
                    type={type}
                    value={localValue}
                    onChange={handleInputChange}
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
                className={`${tableBorder} text-text-primary bg-sheet-main-fill p-1`}
            >
                {options}
            </select>
        </div>
    )
}