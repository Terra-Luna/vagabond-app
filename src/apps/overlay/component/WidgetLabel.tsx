import { useEffect, useRef, useState } from "react"

import { tableBorderRounded } from "../../../view/common/border-styles"
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
            {isEditing
                ? <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`
                        text-sm text-text-header-primary font-eskapade font-normal
                        bg-sheet-header-fill ${tableBorderRounded}
                        mt-2 px-1 text-center focus:outline-none focus:border-destructive-action/33 w-32
                    `}
                />
                : <span title="Double click to edit"
                    onDoubleClick={() => {
                        if (!permissionCheck()) return
                        setIsEditing(true)
                    }}
                    className={`
                            text-sm text-text-primary text-center font-eskapade font-normal
                            bg-sheet-main-fill/25 rounded-sm px-1
                            mt-1 block w-full select-none break-words ${hoverEffect}`}
                    style={{ maxWidth: 100 }}
                >
                    {label && label.trim() !== '' ? label : 'Clock'}
                </span>
            }
        </FoundryHotkeyBlocker>
    )
}