import { useCallback } from "react"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { LabelledField } from "./LabelledField"
import { menuOptionContainer, menuOptionTextDefault, menuOptionTextSelected } from "../common/text-styles"
import { useEditMode } from "../context/EditModeContext/Hooks"

type UpdateMechanism = { updatePath: string[]; onChange?: never; } | { onChange: (val: any) => any; updatePath?: never }

export const DropDown = ({ label = '', value, options, includeNullOption = false, updateMechanism, parent, variant = "standard" }: {
    label?: string,
    value: any,
    options: { label: string, value: string }[],
    includeNullOption?: boolean
    updateMechanism: UpdateMechanism,
    parent: any,
    variant?: "standard" | "alternate"
}) => {
    const { isEditMode } = useEditMode()

    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const { onChange: onChangeFn, updatePath } = updateMechanism
        if (updatePath) {
            updateDocumentAtPath(parent, updatePath, e.target.value)
        }
        else {
            onChangeFn(e.target.value)
        }
    }, [parent, updateMechanism])

    if (includeNullOption) {
        options = [{ label: '-', value: '' }, ...options]
    }

    return (
        <div>
            <LabelledField label={label} variant={variant}>
                {
                    isEditMode ?
                        <div>
                            <Select value={value} onChange={onChange}>
                                {
                                    options.map(it =>
                                        <Option key={`${it.label} ${it.value}`} value={it.value}>
                                            {it.label}
                                        </Option>
                                    )
                                }
                            </Select>
                        </div> :
                        <p className="text-lg font-eskapade text-text-primary bg-sheet-main-fill p-0.5 rounded">
                            {options.find(o => o.value === value)?.label ?? ''}
                        </p>
                }
            </LabelledField>
        </div>
    )
}

const Select = (props: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>) => {
    return <select className={`
        font-eskapade
        text-text-primary
        bg-sheet-main-fill
        border border-solid border-text-primary/50
        rounded py-0.5 text-sm shadow-sm
        ${props.className}
    `} {...props} />
}

const Option = (props: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>) => {
    return <option
        className={`
            ${menuOptionContainer} ${menuOptionTextDefault} ${props.className}
        `}
        {...props}
    />
}