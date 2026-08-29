import { useState } from "react"

import { FormProps } from "../shared/FormProps"
import { ItemRuleInput } from "../shared/ItemRuleInput"

export const GrantItemForm = ({ rule, onChange }: FormProps) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingOver(true)
    }

    const handleDragLeave = () => {
        setIsDraggingOver(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingOver(false)

        const rawData = e.dataTransfer.getData("text/plain")
        if (!rawData) return
        const dropData = JSON.parse(rawData)
        if ((dropData.type === "Item" || dropData.type === "ActiveEffect") && dropData.uuid) {
            const item = fromUuidSync(dropData.uuid)
            onChange({
                uuid: dropData.uuid,
                type: item instanceof foundry.abstract.Document && "type" in item
                    ? (item.type === "base" ? "ActiveEffect" : item.type)
                    : null,
                label: item ? `Grant: ${item.name}` : rule.label
            })
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-x-2">
                <ItemRuleInput
                    label={"Name"}
                    value={rule.label || ""}
                    placeholder={"e.g., Apoplex - Starting Spell"}
                    onChange={(e) => onChange({ label: e.target.value })}
                />
                <ItemRuleInput
                    label={"Level Req."}
                    value={rule.level || ""}
                    placeholder={"0"}
                    onChange={(e) => onChange({ level: e.target.value })}
                    type={"number"}
                />
            </div>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e)}
                className={`
                    flex flex-col rounded-sm border p-1 flex items-center transition-all
                    ${isDraggingOver ? "bg-context-menu-fill shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "border-table-border/50"}`
                }
            >
                <ItemRuleInput
                    label={"Item UUID (Drag & Drop Spells/Perks)"}
                    value={rule.uuid}
                    placeholder={"Item.AbC123XyZ"}
                    onChange={(e) => {
                        const item = fromUuidSync(e.target.value)
                        onChange({
                            uuid: item?.uuid, type: (item instanceof foundry.abstract.Document && "type" in item) ? item.type : null
                        })
                    }}
                />
            </div>
        </div>
    )
}