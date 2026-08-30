import { ItemRuleInput, ItemRuleSelector } from "../shared/ItemRuleInput"

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
            <ItemRuleInput
                label={"Path"}
                value={rule.selector || ""}
                onChange={(e) => onChange({ selector: e.target.value })}
                placeholder={"e.g., skills.arcana.trained"}
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
        </div>
    )
}