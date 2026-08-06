import { useMemo } from "react"
import { FormProps } from "../shared/FormProps"
import { ItemRuleInput } from "../shared/ItemRuleInput"
import { HeroDataModel } from "../../model/actor/HeroDataModel"

export const FlatModifierForm = ({ rule, onChange }: FormProps) => {

    const pathModifierOptions = useMemo(() => {
        const actor = new Actor.implementation({ name: 'Hero', type: 'hero' as any }) as Actor & { system: HeroDataModel }
        const hero = actor.system
        const options: { value: string, label: string }[] = []

        console.log(hero.toObject())


    }, [])

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
                placeholder={"e.g., health.max"}
                onChange={(e) => onChange({ selector: e.target.value })}
            />
            <ItemRuleInput
                label={"Value"}
                value={rule.value ?? 0}
                onChange={(e) => onChange({ value: Number(e.target.value) })}
                type={"number"}
            />
            <ItemRuleInput
                label={"Value Multiplier"}
                value={rule.valueMultiplier ?? ''}
                placeholder={"e.g., level.current"}
                onChange={(e) => onChange({ valueMultiplier: e.target.value })}
            />
        </div>
    )
}