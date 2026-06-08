import { useCallback, useState, KeyboardEvent, useRef, useEffect } from "react";
import VgLiteError from "../../model/common/VgLiteError";
import { getDocumentAtPath, updateDocumentAtPath } from "../../utils/documentUtils";
import { FoundryActor } from "../sheets/actor/VgLiteActorSheet";

export const EditableTextField = ({ initialValue, onSave, updateProps }: { initialValue: string, onSave?: (value: string) => Promise<boolean>, updateProps?: { actor: any, propertyPath: string[] } }) => {
    if (onSave && updateProps) {
        throw new VgLiteError({ name: "ARG_ERROR", message: "Only one of onSave or updateProps should be passed" })
    }
    else if (!onSave && !updateProps) {
        throw new VgLiteError({ name: "ARG_ERROR", message: "One of onSave or updateProps is required" })
    }

    const [isInEditMode, setIsInEditMode] = useState(false)
    const [value, setValue] = useState(initialValue)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const shouldSelectInputRef = useRef(false)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        if (shouldSelectInputRef.current && isInEditMode) {
            inputRef.current?.select()
            shouldSelectInputRef.current = false
        }
    }, [isInEditMode])

    const enterEditMode = useCallback(() => {
        setIsInEditMode(true)
        shouldSelectInputRef.current = true
    }, [])

    const reset = useCallback(() => {
        setValue(initialValue)
        setIsInEditMode(false)
    }, [initialValue, value])

    const save = useCallback(async () => {
        let ret
        if (onSave) {
            ret = await onSave(value)
        }
        else {
            ret = await updateDocumentAtPath(updateProps!.actor, updateProps!.propertyPath, value);
        }

        reset() // todo make these not flash
        setIsInEditMode(false)
        return ret
    }, [value, onSave, updateProps])

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
    }, [value, onSave, initialValue, reset])

    if (isInEditMode) {
        return <input ref={inputRef} className="w-auto field-sizing-content" type="text" value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={save}
            onKeyDown={handleSpecialKeypresses} />
    }
    else {
        return <span onDoubleClick={enterEditMode}>{value}</span>
    }
}

export const EditableNameField = ({ actor }: { actor: FoundryActor<any> }) => {
    const updateName = useCallback(async (newName: string) => {
        return !!await actor.update({ name: newName })
    }, [actor])

    return <EditableTextField initialValue={(actor as any).name} onSave={updateName} />
}