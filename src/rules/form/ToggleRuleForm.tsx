import { appLang } from "../../utils/lang"
import { Checkbox } from "../../view/component/Checkbox"
import { ItemRuleInput, ItemRuleSelector } from "../shared/ItemRuleInput"
import { SelectorInput } from "../shared/SelectorInput"
import { getRuleSelectors } from "../util/selector-util"

export const ToggleRuleForm = ({ rule, onChange }) => {
    return (
        <div className="space-y-2">
            <div className="flex gap-x-2">
                <ItemRuleInput
                    label={appLang.RulesEditor.name}
                    value={rule.label || ""}
                    onChange={(e) => onChange({ label: e.target.value })}
                    placeholder={appLang.RulesEditor.trainingToggleExample}
                />
                <ItemRuleInput
                    type={"number"}
                    label={appLang.RulesEditor.levelRequirement}
                    value={rule.level || ""}
                    onChange={(e) => onChange({ level: e.target.value })}
                    placeholder={"0"}
                />
            </div>
            <SelectorInput
                label={appLang.RulesEditor.path}
                kind="toggle"
                value={getRuleSelectors(rule)}
                onChange={(selector) => onChange({ selector })}
            />
            <ItemRuleSelector
                label={appLang.RulesEditor.selectState}
                value={rule.value ? "true" : "false"}
                options={<>
                    <option value="true">{appLang.RulesEditor.enabled}</option>
                    <option value="false">{appLang.RulesEditor.disabled}</option>
                </>}
                onChange={(e) => onChange({ value: e.target.value === "true" })}
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
