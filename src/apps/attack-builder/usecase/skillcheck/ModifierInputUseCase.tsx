import { useState } from "react"
import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { Label } from "../../component/Labels"

export const useSkillCheckModifierInput = () => {
    const [skillCheckMod, setSkillCheckMod] = useState<number>(0)
    const SkillCheckModifierInput = <div>
        <Label text={"Bonus"} />
        <span className="text-sm">
            <NumericCounterInput
                value={skillCheckMod}
                onChange={(val) => setSkillCheckMod(val)}
            />
        </span>
    </div>
    return { SkillCheckModifierInput, skillCheckMod, setSkillCheckMod }
}