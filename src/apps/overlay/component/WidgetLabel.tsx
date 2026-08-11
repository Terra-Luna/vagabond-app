import { useEffect, useRef, useState } from "react"
import { FoundryHotkeyBlocker } from "../../../view/component/FoundryHotkeyBlocker"

export const WidgetLabel = ({ label, onLabelChange, permissionCheck }: {
    label: string, onLabelChange: (newValue) => void, permissionCheck: () => boolean
}) => {

    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(label ?? '')
    const inputRef = useRef<HTMLInputElement>(null)
    
    useEffect(() => {
        setEditValue(label ?? '')
    }, [label])

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus()
            inputRef.current?.select()
        }
    }, [isEditing])

    const handleSave = () => {
        setIsEditing(false)
        if (editValue.trim() !== label) {
            onLabelChange(editValue.trim())
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave()
        if (e.key === 'Escape') {
            setEditValue(label ?? '')
            setIsEditing(false)
        }
    }

    const hoverEffect = "transform transition-transform duration-300 hover:scale-105"

    return (
        <FoundryHotkeyBlocker>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`
                        text-sm text-text-header-primary font-eskapade font-normal
                        bg-sheet-header-fill border border-solid border-table-border rounded
                        mt-2 px-1 text-center focus:outline-none focus:border-destructive-action/33 w-32
                    `}
                />
            ) : (
                <span
                    title="Double click to edit"
                        onDoubleClick={() => {
                            if (!permissionCheck()) return
                            setIsEditing(true)
                        }}
                    className={`mt-2 text-base text-slate-300 font-eskapade font-normal select-none ${hoverEffect}`}
                >
                    {label && label.trim() !== '' ? label : 'Clock'}
                </span>
            )}
        </FoundryHotkeyBlocker>
    )
}