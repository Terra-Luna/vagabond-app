import { SpellDataModel } from "../../../../../model/item/character/SpellDataModel"
import { appLang } from "../../../../../util/lang"
import { tableBorder } from "../../../../common/border-styles"
import { Checkbox } from "../../../../component/Checkbox"
import { AppliedActiveEffectsInput } from "../../../actor/npc/component/AppliedActiveEffectsInput"
import { ItemSheetPropLabel } from "../../equip/component/ItemSheetLabelComponent"

type SurfacePhase = "onEnter" | "onStay"

/**
 * Edit-mode controls for a spell whose area is a surface: the damage and Active Effects dealt to tokens entering
 * it, and to tokens still inside it when a round starts.
 */
export const SpellSurfaceConfig = ({
  item,
}: {
  item: Item & { system: SpellDataModel }
}) => {
  const surface = item.system.surface
  const update = (path: string, value: unknown) =>
    item.update({ [`system.surface.${path}`]: value } as Record<
      string,
      unknown
    >)

  const phase = (name: SurfacePhase, title: string, hint: string) => {
    const config = surface[name]
    return (
      <div className="space-y-1 pl-2 border-l border-solid border-table-border/40">
        <ItemSheetPropLabel label={title} />
        <p className="text-xs italic text-text-primary/60">{hint}</p>
        <div>
          <ItemSheetPropLabel label={appLang.ItemSheet.surfaceDamage} />
          <input
            key={config.damage}
            type="text"
            defaultValue={config.damage}
            placeholder="1d6"
            onBlur={(e) => {
              if (e.target.value !== config.damage)
                update(`${name}.damage`, e.target.value.trim())
            }}
            className={`${tableBorder} font-eskapade font-bold px-2 max-w-[16ch]`}
          />
        </div>
        <AppliedActiveEffectsInput
          effects={[...(config.activeEffects ?? [])]}
          label={appLang.ItemSheet.surfaceActiveEffects}
          onChange={(activeEffects) =>
            update(`${name}.activeEffects`, activeEffects)
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Checkbox
        label={appLang.ItemSheet.surface}
        checked={surface.enabled}
        onCheckedChanged={(isChecked) => update("enabled", isChecked)}
      />
      {surface.enabled && (
        <>
          {phase(
            "onEnter",
            appLang.ItemSheet.surfaceOnEnter,
            appLang.ItemSheet.surfaceOnEnterHint,
          )}
          {phase(
            "onStay",
            appLang.ItemSheet.surfaceOnStay,
            appLang.ItemSheet.surfaceOnStayHint,
          )}
        </>
      )}
    </div>
  )
}
