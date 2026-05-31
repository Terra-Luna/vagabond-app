import { useCallback } from "react"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { LabelledField } from "./LabelledField"

export const DropDown = ({ label, value, options, updatePath, parent }: { label: string, value: any, options: any[], updatePath: string[], parent: any }) => {
    const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        updateDocumentAtPath(parent, updatePath, e.target.value)
    }, [parent, updatePath])

    return (
        <div className="vglite-dropdown">
            <LabelledField label={label} >
                <div className="vglite-dropdown-select">
                    <select value={value} onChange={onChange}>
                        {options.map(it => <option key={'label' + it}>{it}</option>)}
                    </select>
                </div>
            </LabelledField>
        </div>
    )
}