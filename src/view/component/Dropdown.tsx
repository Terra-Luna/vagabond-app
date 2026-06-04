import { useCallback } from "react"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { LabelledField } from "./LabelledField"

export const DropDown = ({ label, value, options, updatePath, parent }: { label: string, value: any, options: any[], updatePath: string[], parent: any }) => {
    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        updateDocumentAtPath(parent, updatePath, e.target.value)
    }, [parent, updatePath])

    return (
        <div className="">
            <LabelledField label={label} >
                <div className="vglite-dropdown-select">
                    <Select value={value} onChange={onChange}>
                        {options.map(it => <Option key={'label' + it}>{it}</Option>)}
                    </Select>
                </div>
            </LabelledField>
        </div>
    )
}

const Select = (props: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>) => {
    return <select className={`
        border border-solid border-table-border
        rounded py-1 text-sm shadow-sm
        ${props.className}`} {...props} />
}

const Option = (props: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>) => {
    return <option className={`
        bg-btn-primary-fill text-btn-primary-text checked:bg-btn-secondary-text
        ${props.className}`}
        {...props}
    />
}