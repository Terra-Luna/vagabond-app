import { Checkbox } from "../../view/component/Checkbox"
import { ItemRuleInput, ItemRuleSelector } from "../shared/ItemRuleInput"
import { SelectorInput } from "../shared/SelectorInput"
import { getRuleSelectors } from "../util/selector-util"

export const ToggleRuleForm = ({ rule, onChange }) => {
    return (
        <div className="space-y-2">
            <div className="flex gap-x-2">
                <ItemRuleInput
                    label={"Name"}
                    value={rule.label || ""}
                    onChange={(e) => onChange({ label: e.target.value })}
                    placeholder={"e.g., Training: Arcane"}
                />
                <ItemRuleInput
                    type={"number"}
                    label={"Level Req."}
                    value={rule.level || ""}
                    onChange={(e) => onChange({ level: e.target.value })}
                    placeholder={"0"}
                />
            </div>
            <SelectorInput
                label={"Path"}
                kind="toggle"
                value={getRuleSelectors(rule)}
                onChange={(selector) => onChange({ selector })}
            />
            <ItemRuleSelector
                label={"Select State"}
                value={rule.value ? "true" : "false"}
                options={<>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                </>}
                onChange={(e) => onChange({ value: e.target.value === "true" })}
            />
            <Checkbox
                label="Toggleable Effect"
                checked={rule.toggleableEffect || false}
                color="text-text-primary"
                onCheckedChanged={(checked) => {
                    onChange({ ...rule, toggleableEffect: checked })
                }}
            />
        </div>
    )
}
