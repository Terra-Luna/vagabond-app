import { appLang } from "../../util/lang"
import { Checkbox } from "../../view/component/Checkbox"
import { DropZone } from "../../view/component/DropZone"
import { FormProps } from "../shared/FormProps"
import { ItemRuleInput, ItemRuleSelector } from "../shared/ItemRuleInput"
import { SelectorInput } from "../shared/SelectorInput"
import { getRuleSelectors } from "../util/selector-util"
import { WhileInLightSelector } from "./WhileInLightSelector"

export const ApplyStatusForm = ({ rule, onChange }: FormProps) => {
  const mode: "status" | "modifier" | "activeEffect" =
    rule.mode === "activeEffect" || rule.mode === "modifier"
      ? rule.mode
      : "status"

  const handleDrop = async (e: React.DragEvent) => {
    const rawData = e.dataTransfer.getData("text/plain")
    if (!rawData) return
    const dropData = JSON.parse(rawData)
    if (dropData.type !== "ActiveEffect" || !dropData.uuid) return
    const effect = (await fromUuid(dropData.uuid)) as any
    onChange({
      uuid: dropData.uuid,
      label: effect?.name ?? rule.label,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-2">
        <ItemRuleInput
          label={appLang.RulesEditor.name}
          value={rule.label || ""}
          placeholder={appLang.RulesEditor.applyStatusExample}
          onChange={(e) => onChange({ label: e.target.value })}
        />
        <ItemRuleInput
          label={appLang.RulesEditor.levelRequirement}
          value={rule.level ?? 0}
          onChange={(e) => onChange({ level: Number(e.target.value) })}
          type={"number"}
        />
      </div>
      <Checkbox
        label={appLang.RulesEditor.whileIlluminatedBy}
        checked={!!rule.whileInLight}
        color="text-text-primary"
        onCheckedChanged={(checked) =>
          onChange({ whileInLight: checked ? "sunlight" : "" })
        }
      />
      {rule.whileInLight && (
        <WhileInLightSelector
          value={rule.whileInLight}
          allowNone={false}
          onChange={(whileInLight) => onChange({ whileInLight })}
        />
      )}
      <ItemRuleSelector
        label={appLang.RulesEditor.applies}
        value={mode}
        options={
          <>
            <option value="status">{appLang.RulesEditor.status}</option>
            <option value="modifier">{appLang.RulesEditor.modifier}</option>
            <option value="activeEffect">
              {appLang.RulesEditor.activeEffect}
            </option>
          </>
        }
        onChange={(e) => onChange({ mode: e.target.value })}
      />
      {mode === "modifier" && (
        <div className="space-y-2">
          <SelectorInput
            label={appLang.RulesEditor.path}
            kind="modifier"
            value={getRuleSelectors(rule)}
            onChange={(selector) => onChange({ selector })}
          />
          <ItemRuleInput
            label={appLang.RulesEditor.value}
            value={rule.value ?? "0"}
            onChange={(e) => onChange({ value: e.target.value })}
            type={"text"}
          />
          <ItemRuleInput
            label={appLang.RulesEditor.valueMultiplier}
            value={rule.valueMultiplier ?? ""}
            placeholder={appLang.RulesEditor.valueMultiplierExample}
            onChange={(e) => onChange({ valueMultiplier: e.target.value })}
          />
        </div>
      )}
      {mode === "status" && (
        <div className="flex flex-wrap gap-x-2">
          <ItemRuleSelector
            label={appLang.RulesEditor.status}
            value={rule.status ?? "burning"}
            options={Object.entries(appLang.StatusConditions).map(
              ([key, status]: [string, any]) => (
                <option key={key} value={key}>
                  {status.name}
                </option>
              ),
            )}
            onChange={(e) => onChange({ status: e.target.value })}
          />
          {(rule.status ?? "burning") === "burning" && (
            <ItemRuleSelector
              label={appLang.RulesEditor.damageType}
              value={rule.damageType ?? "fire"}
              options={Object.entries(appLang.DamageTypes).map(
                ([key, name]) => (
                  <option key={key} value={key}>
                    {name as string}
                  </option>
                ),
              )}
              onChange={(e) => onChange({ damageType: e.target.value })}
            />
          )}
          <ItemRuleInput
            label={appLang.RulesEditor.countdownDie}
            value={rule.die ?? 6}
            onChange={(e) => onChange({ die: Number(e.target.value) })}
            type={"number"}
          />
        </div>
      )}
      {mode === "activeEffect" && (
        <DropZone
          unstyled
          onDrop={handleDrop}
          className={(hovered) => `
                    flex flex-col rounded-sm border p-1 items-center transition-all
                    ${hovered ? "bg-context-menu-fill shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "border-table-border/50"}`}
        >
          <ItemRuleInput
            label={appLang.RulesEditor.activeEffectDrop}
            value={rule.uuid ?? ""}
            placeholder={
              "Compendium.vagabond-app.active-effects.ActiveEffect.AbC123"
            }
            onChange={(e) => onChange({ uuid: e.target.value })}
          />
        </DropZone>
      )}
    </div>
  )
}
