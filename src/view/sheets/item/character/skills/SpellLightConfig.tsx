import { normalizeLightRange } from "../../../../../combat/engine/util/active-effect-fx"
import { SpellDataModel } from "../../../../../model/item/character/SpellDataModel"
import { appLang } from "../../../../../util/lang"
import { tableBorder } from "../../../../common/border-styles"
import { Checkbox } from "../../../../component/Checkbox"
import { CustomDropDown } from "../../../../component/Dropdown"
import { OptionsSelectionMenu, StringOptionsDisplay } from "../../../../component/OptionsSelectionMenu"
import { SingleSelect } from "../../../../component/SingleSelect"
import { ItemSheetPropLabel } from "../../equip/component/ItemSheetLabelComponent"

const durationOptions = appLang.Duration.filter(
  (opt: { value: string }) =>
    opt.value === "continual" ||
    opt.value === "focus" ||
    opt.value.startsWith("Cd"),
)

const lightTypeOptions = [
  { value: "basic", label: appLang.ItemSheet.lightTypeNone },
  { value: "sunlight", label: appLang.ItemSheet.sunlight },
  { value: "moonlight", label: appLang.ItemSheet.moonlight },
]

const beingTypeLabels = {
  ...appLang.BeingTypes,
  ...appLang.BeingSubtypes,
} as Record<string, string>
const beingTypeKeys = Object.keys(beingTypeLabels).filter(
  (key) => key !== "none",
)

/**
 * Edit-mode controls for a spell that makes its targets emit light when cast for effect.
 */
export const SpellLightConfig = ({
  item,
}: {
  item: Item & { system: SpellDataModel }
}) => {
  const light = item.system.emitsLight
  const burns: string[] = [...(light.burns ?? [])]
  const update = (path: string, value: unknown) =>
    item.update({ [`system.emitsLight.${path}`]: value } as Record<
      string,
      unknown
    >)

  return (
    <div className="space-y-2">
      <Checkbox
        label={appLang.Effects.emitsLight}
        checked={light.enabled}
        onCheckedChanged={(isChecked) => update("enabled", isChecked)}
      />
      {light.enabled && (
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <ItemSheetPropLabel label={appLang.ItemSheet.lightType} />
            <SingleSelect
              options={lightTypeOptions}
              value={light.type}
              setValue={(val) => update("type", val)}
            />
          </div>
          <div>
            <ItemSheetPropLabel label={appLang.ItemSheet.lightRange} />
            <input
              type="number"
              min={0}
              value={light.range}
              onChange={(e) =>
                update("range", normalizeLightRange(e.target.value))
              }
              className={`${tableBorder} font-eskapade font-bold px-2 max-w-[8ch]`}
            />
          </div>
          <div>
            <ItemSheetPropLabel label={appLang.Effects.duration} />
            <CustomDropDown
              value={light.duration}
              options={durationOptions}
              onChange={(e) => update("duration", e.target.value)}
            />
          </div>
          <div>
            <ItemSheetPropLabel label={appLang.Effects.lightBurns} />
            <div className="flex items-center">
              <StringOptionsDisplay
                options={burns.map((b) => beingTypeLabels[b] ?? b)}
              />
              <OptionsSelectionMenu
                options={beingTypeKeys.map((key) => ({
                  key,
                  value: beingTypeLabels[key],
                  isSelected: burns.includes(key),
                }))}
                onChange={(keys) => update("burns", keys)}
              />
            </div>
          </div>
          <div>
            <ItemSheetPropLabel label={appLang.Effects.lightBurnDamage} />
            <input
              type="text"
              defaultValue={light.burnDamage}
              placeholder="2d8"
              onBlur={(e) => update("burnDamage", e.target.value.trim())}
              className={`${tableBorder} font-eskapade font-bold px-2 max-w-[10ch]`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
