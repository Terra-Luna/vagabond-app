import { useCallback, useState, KeyboardEvent, useRef, useEffect } from "react";

export const EditableTextField = ({ initialValue, onSave }: { initialValue: string, onSave: (value: string) => Promise<boolean> }) => {
    const [isInEditMode, setIsInEditMode] = useState(false)
    const [value, setValue] = useState(initialValue)
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
    }, [])

    const reset = useCallback(() => {
        setValue(initialValue)
        setIsInEditMode(false)
    }, [initialValue, value])

    const handleSpecialKeypresses = useCallback(async (e: KeyboardEvent) => {
        switch (e.code) {
            case "Enter":
                e.preventDefault()
                e.stopPropagation()
                if (await onSave(value)) {
                    setIsInEditMode(false)
                }
                break;
            case "Escape":
                e.preventDefault()
                e.stopPropagation()
                reset()
                break;
        }
    }, [value, onSave, initialValue, reset])

    if (isInEditMode) {
        return <input ref={inputRef} className="vglite-editable-text-field" type="text" value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={reset}
            onKeyDown={handleSpecialKeypresses} />
    }
    else {
        return <span onDoubleClick={enterEditMode}>{value}</span>
    }
}