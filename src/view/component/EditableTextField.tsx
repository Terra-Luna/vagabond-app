import { useCallback, useState, KeyboardEvent, useRef, useEffect } from "react"
import { VgLiteError}  from "../../model/common/VgLiteError"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { glowOnHover } from "../common/text-styles"
import { useEditMode } from "../context/EditModeContext/Hooks"
import { Plus, Minus } from "lucide-react"

const editModeBorder = "border border-solid border-table-border px-1"

export const EditableTextField = (
    { boundValue, onSave, updateProps, placeholder = "Enter text...", hideBorderOnEditMode = false, className = '' }: {
        boundValue: string | null,
        onSave?: (value: string | null) => Promise<boolean>,
        updateProps?: { object: any, path: string[] },
        placeholder?: string,
        hideBorderOnEditMode?: boolean,
        className?: string
    }) => {
    const { isEditMode: enabled } = useEditMode()

    if (onSave && updateProps) {
        throw new VgLiteError({ name: "ARG_ERROR", message: "Only one of onSave or updateProps should be passed" })
    }
    else if (!onSave && !updateProps) {
        throw new VgLiteError({ name: "ARG_ERROR", message: "One of onSave or updateProps is required" })
    }

    const [isInEditMode, setIsInEditMode] = useState(false)
    const [editModeValue, setEditModeValue] = useState(boundValue)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const shouldSelectInputRef = useRef(false)

    useEffect(() => {
        if (shouldSelectInputRef.current && isInEditMode) {
            inputRef.current?.select()
            shouldSelectInputRef.current = false
        }
    }, [isInEditMode])

    const enterEditMode = useCallback(() => {
        setIsInEditMode(true)
        shouldSelectInputRef.current = true
        setEditModeValue(boundValue)
    }, [boundValue])

    const reset = useCallback(() => {
        setEditModeValue(boundValue)
        setIsInEditMode(false)
    }, [boundValue, editModeValue])

    const save = useCallback(async () => {
        let ret
        if (onSave) {
            ret = await onSave(editModeValue)
        }
        else {
            ret = await updateDocumentAtPath(updateProps!.object, updateProps!.path, editModeValue);
        }

        setIsInEditMode(false)
        return ret
    }, [editModeValue, onSave, updateProps])

    if (isInEditMode || boundValue === '' || boundValue == null) {
        const inputStyle = (editModeValue === '' || editModeValue == null) ? `field-sizing-content border border-solid border-table-border rounded-sm px-1 ${className}` : `w-auto field-sizing-content ${className}`
        return <div className="overflow-hidden">
            <form onSubmit={(e) => {
                e.stopPropagation()
                e.preventDefault()
                save()
            }}>
                <input ref={inputRef} className={inputStyle} type="text"
                    value={editModeValue ?? ''}
                    placeholder={placeholder}
                    onChange={e => setEditModeValue(e.target.value)}
                    onBlur={save}
                />
            </form>
        </div>
    }
    else {
        const divStyle = `overflow-hidden whitespace-normal text-wrap ${className}`
        return (<>
            {
                enabled ?
                    <button title={'Double-click to Edit'} onDoubleClick={enterEditMode}>
                        <div className={`${glowOnHover} ${hideBorderOnEditMode ? "" : editModeBorder} {divStyle}`}>
                            {boundValue}
                        </div >
                    </button> :
                    <div className={divStyle}>{boundValue}</div>
            }
        </>)
    }
}

export const EditableNameField = ({ actor }: { actor: Actor }) => {
    const updateName = useCallback(async (newName: string | null) => {
        return !!await actor.update({
            'name': newName,
            'prototypeToken.name': newName
        } as Record<string, string>)
    }, [actor])

    return <EditableTextField boundValue={(actor as any).name} onSave={updateName} hideBorderOnEditMode={true} />
}

export const NumericCounterInput = ({ value, valueAppend = '', onUpdateValue, incrementBy = 1 }: {
    value: number, valueAppend?: string, onUpdateValue: (input) => void, incrementBy?: number
}) => {
    return (
        <div className="flex">
            <EditableTextField boundValue={`${value.toString()}${valueAppend}`} onSave={onUpdateValue as any} className="min-w-[3ch]" />
            <div className="flex flex-col mt-1 ml-1">
                <Plus size={14} className="cursor-pointer" onClick={() => onUpdateValue(value + incrementBy)} />
                <Minus size={14} className="cursor-pointer" onClick={() => onUpdateValue(value - incrementBy)} />
            </div>
        </div>
    )
}