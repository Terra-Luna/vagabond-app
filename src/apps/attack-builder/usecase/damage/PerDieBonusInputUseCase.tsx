import { useState } from "react"

import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { CounterInput } from "../../component/CounterInput"
import { Label } from "../../component/Labels"

export const usePerDieBonusInput = () => {
    const [perDieBonus, setPerDieBonus] = useState<number>(0)

    const PerDieBonusInput =
        <CounterInput tooltip={"Adds damage per damage die rolled\n(including exploding dice)"}>
            <Label text={"Per-die Bonus"} />
            <NumericCounterInput value={perDieBonus} onChange={(val) => setPerDieBonus(Math.max(0, val))} />
        </CounterInput>

    return { PerDieBonusInput, perDieBonus, setPerDieBonus }
}