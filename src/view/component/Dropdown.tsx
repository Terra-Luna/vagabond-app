import { useCallback } from "react"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { LabelledField } from "./LabelledField"
import { menuOptionContainer, menuOptionTextDefault } from "../common/text-styles"
import { useEditMode } from "../context/EditModeContext/Hooks"
import { EditModeContextProvider } from "../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../context/EditModeContext/EditModeOptions"

type UpdateMechanism = { updatePath: string[]; onChange?: never; } | { onChange: (val: any) => any; updatePath?: never }

interface DropDownProps {
    label?: string,
    value: string,
    options: { label: string, value: any }[],
    includeNullOption?: boolean,
    updateMechanism: UpdateMechanism,
    parent?: any,
    variant?: "steel" | "alternate"
}

export const DropDown = ({ label = '', value, options, includeNullOption = false, updateMechanism, parent, variant = "steel" }: DropDownProps) => {
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
            <LabelledField label={label ?? ''} variant={variant} className="text-base font-eskapade font-bold">
                {
                    isEditMode ?
                        <div>
                            <Select value={value} onChange={onChange} className="outline-none focus:outline-none focus:ring-0">
                                {
                                    options.map(it =>
                                        <Option key={`${it.label} ${it.value}`} value={it.value}>
                                            {it.label}
                                        </Option>
                                    )
                                }
                            </Select>
                        </div> :
                        <p className="text-lg font-eskapade text-text-primary bg-sheet-main-fill p-0.5">
                            {options.find(o => o.value === value)?.label ?? ''}
                        </p>
                }
            </LabelledField>
        </div>
    )
}

export const CustomDropDown = ({ value, options, className, onChange, editModeOverride = false }: {
    value: string, options: { value: string, label: string }[], className?: string, onChange: (val: any) => any, editModeOverride?: boolean
}) => {
    const { isEditMode } = useEditMode()

    return (<>
        {editModeOverride || isEditMode
            ? <Select
                value={value}
                onChange={onChange}
                className={`
                    flex px-1 pb-0.5 pt-0.5
                    outline-none focus:outline-none focus:ring-0
                    border border-solid border-table-border/50
                    ${className}
                `}>
                {options.map(opt => (<Option key={opt.value} value={opt.value}>{opt.label}</Option>))}
            </Select >
            : <div className={`${className ? className : 'text-xl text-text-primary font-eskapade'}`}>
                {options.find(it => it.value === value)?.label}
            </div>
        }
    </>)
}

export const Select = (props: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>) => {
    return <select className={`
        font-eskapade
        text-text-primary
        bg-sheet-main-fill
        border border-solid border-text-primary/50
        py-0.5 text-sm shadow-sm
        ${props.className}
    `} {...props} />
}

export const Option = (props: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>) => {
    return <option
        className={`
            ${menuOptionContainer} ${menuOptionTextDefault} ${props.className}
        `}
        {...props}
    />
}