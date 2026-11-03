import { DropZone } from "../../view/component/DropZone"
import { FormProps } from "../shared/FormProps"
import { ItemRuleInput } from "../shared/ItemRuleInput"

export const GrantItemForm = ({ rule, onChange }: FormProps) => {
  const handleDrop = async (e: React.DragEvent) => {
    const rawData = e.dataTransfer.getData("text/plain")
    if (!rawData) return
    const dropData = JSON.parse(rawData)

    if (
      (dropData.type === "Item" || dropData.type === "ActiveEffect") &&
      dropData.uuid
    ) {
      const item = (await fromUuid(dropData.uuid)) as any
      const type =
        item instanceof ActiveEffect
          ? "ActiveEffect"
          : (item?.type ??
            (dropData.type === "ActiveEffect" ? "ActiveEffect" : null))

      onChange({
        uuid: dropData.uuid,
        type: type,
        label: item ? `${item.name}` : rule.label,
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
      <DropZone
        unstyled
        onDrop={handleDrop}
        className={(hovered) => `
                    flex flex-col rounded-sm border p-1 items-center transition-all
                    ${hovered ? "bg-context-menu-fill shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "border-table-border/50"}`}
      >
        <ItemRuleInput
          label={"Item UUID (Drag & Drop Spells/Perks)"}
          value={rule.uuid}
          placeholder={"Item.AbC123XyZ"}
          onChange={(e) => {
            const item = fromUuidSync(e.target.value)
            onChange({
              uuid: item?.uuid,
              type:
                item instanceof foundry.abstract.Document && "type" in item
                  ? item.type
                  : null,
            })
          }}
        />
      </DropZone>
    </div>
  )
}
