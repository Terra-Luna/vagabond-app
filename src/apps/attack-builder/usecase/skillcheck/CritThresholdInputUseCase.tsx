import { useState } from "react"
import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { Label } from "../../component/Labels"

export const useSkillCheckCritThresholdInput = () => {
    const [critThreshold, setCritThreshold] = useState<number>(20)
    const SkillCheckCritThresholdInput = <div>
        <Label text={"Crit"} />
        <span className="text-sm">
            <NumericCounterInput
                value={critThreshold}
                onChange={(val) => setCritThreshold(val)}
            />
        </span>
    </div>
    return { SkillCheckCritThresholdInput, critThreshold }
}