import { useMemo } from "react"

import { MultiSelect, SelectOption } from "../../view/component/MultiSelect"
import { getSelectorOptions, isValidSelector, normalizeSelector, SelectorKind } from "../util/selector-util"
import { ItemRulesLabel } from "./ItemRulesTypography"

interface SelectorInputProps {
    label: string
    value: string[]
    kind: SelectorKind
    onChange: (selector: string[]) => void
}

export const SelectorInput = ({ label, value, kind, onChange }: SelectorInputProps) => {
    const options = useMemo(() => getSelectorOptions(kind), [kind])
    const selected: SelectOption[] = (value ?? []).map(path => ({ label: path, value: path }))

    return (
        <div className="flex flex-col gap-2">
            <ItemRulesLabel text={label} />
            <MultiSelect
                options={options}
                value={selected}
                placeholder="Start typing a path, e.g., health.max"
                isValidNewOption={input => isValidSelector(input, kind)}
                handleOnChange={values => {
                    const next = Array.from(new Set(values.map(v => normalizeSelector(v.value)).filter(s => isValidSelector(s, kind))))
                    onChange(next)
                }}
            />
        </div>
    )
}

