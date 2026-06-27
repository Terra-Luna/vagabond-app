import { useCallback, useState, KeyboardEvent, useRef, useEffect } from "react"
import VgLiteError from "../../model/common/VgLiteError"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { FoundryActor } from "../sheets/actor/VgLiteActorSheet"
import { glowOnHover } from "../sheets/VgLiteSheet"

export const EditableTextField = (
    { boundValue, onSave, updateProps, placeholder = "Enter text..." }: { 
        boundValue: string | null, 
        onSave?: (value: string | null) => Promise<boolean>, 
        updateProps?: { actor: any, propertyPath: string[] },
        placeholder?: string
}) => {
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
            ret = await updateDocumentAtPath(updateProps!.actor, updateProps!.propertyPath, editModeValue);
        }

        setIsInEditMode(false)
        return ret
    }, [editModeValue, onSave, updateProps])

    const handleSpecialKeypresses = useCallback(async (e: KeyboardEvent) => {
        switch (e.code) {
            case "Enter":
            case "NumpadEnter":
                e.preventDefault()
                if (await save()) {
                    setIsInEditMode(false)
                }
                break;
            case "Escape":
                e.preventDefault()
                reset()
                break;
        }

        e.stopPropagation() // otherwise wasd results in movement
    }, [editModeValue, onSave, boundValue, reset])

    if (isInEditMode || boundValue === '' || boundValue == null) {
        const inputStyle = (editModeValue === '' || editModeValue == null) ? "field-sizing-content border border-solid border-stat-block-fill rounded-xs px-1" : "w-auto field-sizing-content"
        return <input ref={inputRef} className={inputStyle} type="text" value={editModeValue ?? ''} placeholder={placeholder}
            onChange={e => setEditModeValue(e.target.value)}
            onBlur={save}
            onKeyDown={handleSpecialKeypresses} />
    }
    else {
        return <span onDoubleClick={enterEditMode} className={`${glowOnHover}`}>{boundValue}</span>
    }
}

export const EditableNameField = ({ actor }: { actor: FoundryActor<any> }) => {
    const updateName = useCallback(async (newName: string | null) => {
        return !!await actor.update({ name: newName })
    }, [actor])

    return <EditableTextField boundValue={(actor as any).name} onSave={updateName} />
}