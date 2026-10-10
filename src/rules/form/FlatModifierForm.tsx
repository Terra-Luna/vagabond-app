import { appLang } from "../../utils/lang"
import { Checkbox } from "../../view/component/Checkbox"
import { FormProps } from "../shared/FormProps"
import { ItemRuleInput } from "../shared/ItemRuleInput"
import { SelectorInput } from "../shared/SelectorInput"
import { getRuleSelectors } from "../util/selector-util"

export const FlatModifierForm = ({ rule, onChange }: FormProps) => {

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-x-1">
                <ItemRuleInput
                    label={appLang.RulesEditor.name}
                    value={rule.label || ""}
                    placeholder={appLang.RulesEditor.hulkingExample}
                    onChange={(e) => onChange({ label: e.target.value })}
                />
                <ItemRuleInput
                    label={appLang.RulesEditor.levelRequirement}
                    value={rule.level ?? 0}
                    onChange={(e) => onChange({ level: Number(e.target.value) })}
                    type={"number"}
                />
                <ItemRuleInput
                    label={appLang.RulesEditor.levelsHereafter}
                    value={rule.scale ?? 0}
                    onChange={(e) => onChange({ scale: Number(e.target.value) })}
                    type={"number"}
                />
            </div>
            <SelectorInput
                label={appLang.RulesEditor.path}
                kind="modifier"
                value={getRuleSelectors(rule)}
                onChange={(selector) => onChange({ selector })}
            />
            <ItemRuleInput
                label={appLang.RulesEditor.value}
                value={rule.value ?? '0'}
                onChange={(e) => onChange({ value: e.target.value })}
                type={"text"}
            />
            <ItemRuleInput
                label={appLang.RulesEditor.valueMultiplier}
                value={rule.valueMultiplier ?? ''}
                placeholder={appLang.RulesEditor.valueMultiplierExample}
                onChange={(e) => onChange({ valueMultiplier: e.target.value })}
            />
            <Checkbox
                label={appLang.RulesEditor.toggleableEffect}
                checked={rule.toggleableEffect || false}
                color="text-text-primary"
                onCheckedChanged={(checked) => {
                    onChange({ ...rule, toggleableEffect: checked })
                }}
            />
        </div>
    )
}
