import { AppliedStatusesInput } from "../../../../../combat/ui/AppliedStatusesInput"
import { SpellDataModel } from "../../../../../model/item/character/SpellDataModel"
import { appLang } from "../../../../../util/lang"
import { tableBorder } from "../../../../common/border-styles"
import { Checkbox } from "../../../../component/Checkbox"
import { SingleSelect } from "../../../../component/SingleSelect"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { AppliedActiveEffectsInput } from "../../../actor/npc/component/AppliedActiveEffectsInput"
import { ItemSheetPropLabel } from "../../equip/component/ItemSheetLabelComponent"
import { DamageTypeSelector } from "../../shared/DamageTypeSelector"
import { BaseSkillSheetComponent } from "./shared/BaseSkillSheetComponent"
import { SpellLightConfig } from "./SpellLightConfig"
import { SpellSurfaceConfig } from "./SpellSurfaceConfig"

const autoTargetingOptions = [
  { value: "none", label: appLang.ItemSheet.autoTargetingNone },
  { value: "hostile", label: appLang.ItemSheet.autoTargetingHostile },
  { value: "friendly", label: appLang.ItemSheet.autoTargetingFriendly },
]

export const SpellSheetComponent = ({
  item,
}: {
  item: Item & { system: SpellDataModel }
}) => {
  const { isEditMode } = useEditMode()
  return (
    <BaseSkillSheetComponent
      item={item}
      content={
        <div className="space-y-4 pb-4">
          {isEditMode && (
            <div className="space-y-2">
              <div className="flex gap-x-8 items-end">
                <DamageTypeSelector item={item} path={"system.damageType"} />
                <div>
                  <ItemSheetPropLabel label={appLang.ItemSheet.baseManaCost} />
                  <input
                    type="number"
                    value={item.system.baseManaCost}
                    onChange={(e) =>
                      item.update({
                        "system.baseManaCost": Number(e.target.value),
                      } as Record<string, number>)
                    }
                    className={`${tableBorder} font-eskapade font-bold px-2 max-w-[8ch]`}
                  />
                </div>
              </div>

              <div className="w-fit">
                <ItemSheetPropLabel
                  label={appLang.ItemSheet.autoTargetingPref}
                />
                <SingleSelect
                  options={autoTargetingOptions}
                  value={item.system.autoTargetingPref}
                  setValue={(val) =>
                    item.update({
                      "system.autoTargetingPref": val,
                    } as Record<string, string>)
                  }
                />
              </div>

              <AppliedStatusesInput item={item} />

              <AppliedActiveEffectsInput
                effects={item.system.appliedActiveEffects ?? []}
                onChange={(appliedActiveEffects) =>
                  item.update({
                    "system.appliedActiveEffects": appliedActiveEffects,
                  } as Record<string, unknown>)
                }
              />

              <SpellLightConfig item={item} />

              <SpellSurfaceConfig item={item} />

              <Checkbox
                label={appLang.ItemSheet.ignoreEffCost}
                checked={item.system.ignoreEffectCost}
                onCheckedChanged={(isChecked) =>
                  item.update({
                    "system.ignoreEffectCost": isChecked,
                  } as Record<string, boolean>)
                }
              />
              <Checkbox
                label={appLang.ItemSheet.upcastableEffect}
                checked={item.system.upcastableEffect}
                onCheckedChanged={(isChecked) =>
                  item.update({
                    "system.upcastableEffect": isChecked,
                  } as Record<string, boolean>)
                }
              />
              {item.system.upcastableEffect && (
                <Checkbox
                  label={appLang.ItemSheet.upcastableEffectDieRoll}
                  checked={item.system.upcastableEffectDieRoll}
                  onCheckedChanged={(isChecked) =>
                    item.update({
                      "system.upcastableEffectDieRoll": isChecked,
                    } as Record<string, boolean>)
                  }
                />
              )}
              <Checkbox
                label={appLang.ItemSheet.focusExempt}
                checked={item.system.focusExempt}
                onCheckedChanged={(isChecked) =>
                  item.update({
                    "system.focusExempt": isChecked,
                  } as Record<string, boolean>)
                }
              />
              <Checkbox
                label={appLang.ItemSheet.upkeepForce}
                checked={item.system.upkeep?.force}
                onCheckedChanged={(isChecked) =>
                  item.update({
                    "system.upkeep.force": isChecked,
                  } as Record<string, boolean>)
                }
              />
              {item.system.upkeep?.force && (
                <Checkbox
                  label={appLang.ItemSheet.upkeepPerTarget}
                  checked={item.system.upkeep?.perTarget}
                  onCheckedChanged={(isChecked) =>
                    item.update({
                      "system.upkeep.perTarget": isChecked,
                    } as Record<string, boolean>)
                  }
                />
              )}
            </div>
          )}
        </div>
      }
    />
  )
}
