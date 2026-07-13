import { FormProps } from "../shared/FormProps"
import { ItemRuleInput } from "../shared/ItemRuleInput"

export const FlatModifierForm = ({ rule, onChange }: FormProps) => {
    return (
        <div className="space-y-2">
            <div className="flex gap-x-1">
                <ItemRuleInput
                    label={"Name"}
                    value={rule.label || ""}
                    placeholder={"e.g., Hulking"}
                    onChange={(e) => onChange({ label: e.target.value })}
                />
                <ItemRuleInput
                    label={"Level Req."}
                    value={rule.level ?? 0}
                    onChange={(e) => onChange({ level: Number(e.target.value) })}
                    type={"number"}
                />
            </div>
            <ItemRuleInput
                label={"Path"}
                value={rule.selector || ""}
                placeholder={"e.g., health.hp.max"}
                onChange={(e) => onChange({ selector: e.target.value })}
            />
            <ItemRuleInput
                label={"Value Modifier"}
                value={rule.value ?? 0}
                onChange={(e) => onChange({ value: Number(e.target.value) })}
                type={"number"}
            />
        </div>
    )
}