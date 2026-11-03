import { useEffect, useState } from "react"

import { appLang } from "../../../../../util/lang"
import { CustomDropDown } from "../../../../component/Dropdown"
import { DropZone } from "../../../../component/DropZone"
import { TrashButton } from "../../../../component/TrashButton"
import { ItemSheetPropLabel } from "../../../item/equip/component/ItemSheetLabelComponent"

export type AppliedActiveEffect = { uuid: string; duration?: string }

const useEffectName = (uuid: string) => {
  const [name, setName] = useState<string>()
  useEffect(() => {
    let cancelled = false
    fromUuid(uuid as any).then((doc: any) => {
      if (!cancelled) setName(doc?.name ?? uuid)
    })
    return () => {
      cancelled = true
    }
  }, [uuid])
  return name ?? "..."
}

const AppliedActiveEffectRow = ({
  entry,
  onDurationChange,
  onRemove,
}: {
  entry: AppliedActiveEffect
  onDurationChange: (duration: string) => void
  onRemove: () => void
}) => {
  const name = useEffectName(entry.uuid)
  return (
    <div className="flex items-center gap-1 text-base font-eskapade font-normal">
      <p className="grow truncate" title={name}>
        {name}
      </p>
      <div title={appLang.Effects.duration}>
        <CustomDropDown
          value={entry.duration ?? ""}
          options={appLang.Duration}
          onChange={(e) => onDurationChange(e.target.value)}
        />
      </div>
      <TrashButton title={appLang.Effects.removeEffect} onClick={onRemove} />
    </div>
  )
}

/**
 * Lets users drop Active Effects and choose how long each one lasts.
 */
export const AppliedActiveEffectsInput = ({
  effects,
  onChange,
}: {
  effects: AppliedActiveEffect[]
  onChange: (effects: AppliedActiveEffect[]) => unknown
}) => {
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    const dragData = foundry.applications.ux.TextEditor.getDragEventData(
      event.nativeEvent,
    ) as any
    if (dragData?.type !== "ActiveEffect" || !dragData.uuid) return
    if (effects.some((it) => it.uuid === dragData.uuid)) return
    await onChange([...effects, { uuid: dragData.uuid, duration: "" }])
  }

  return (
    <div className="flex flex-col w-full gap-0.5">
      <ItemSheetPropLabel label={appLang.Effects.appliedActiveEffects} />

      {effects.map((entry, index) => (
        <AppliedActiveEffectRow
          key={entry.uuid}
          entry={entry}
          onDurationChange={(duration) =>
            onChange(
              effects.map((it, i) => (i === index ? { ...it, duration } : it)),
            )
          }
          onRemove={() => onChange(effects.filter((_, i) => i !== index))}
        />
      ))}

      <DropZone onDrop={handleDrop}>
        <span className="italic">{appLang.Effects.dropActiveEffect}</span>
      </DropZone>
    </div>
  )
}
