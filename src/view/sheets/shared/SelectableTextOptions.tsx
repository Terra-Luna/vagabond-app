import { getDocumentAtPath } from "../../../utils/documentUtils"
import { OptionsSelectionMenu, StringOptionsDisplay } from "../../component/OptionsSelectionMenu"
import { useEditMode } from "../../context/EditModeContext/Hooks"

export const SelectableTextOptions = ({ obj, label, path, localeObj }: {
    obj: any, label: string, path: string[], localeObj: any
}) => {
    const { isEditMode } = useEditMode()
    const field = getDocumentAtPath(obj, path)
    const options = Object.keys(localeObj).filter(k => k != 'none').map(k => (
        { key: k, value: localeObj[k].name, isSelected: field.indexOf(k) > -1 }
    ))
    return (<>
        {
            !isEditMode && field.length === 0 ? <></> :
                <div className="flex space-x-2">
                    {isEditMode
                        ? <OptionsSelectionMenu obj={obj} label={label} path={path} options={options} />
                        : <p>{label}:</p>
                    }
                    <StringOptionsDisplay options={options.filter(o => o.isSelected).map(o => o.value)} />
                </div>
        }
    </>)
}