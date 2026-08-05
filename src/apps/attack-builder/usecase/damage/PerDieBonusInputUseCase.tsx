import { useState } from "react"
import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { Label } from "../../component/Labels"
import { CounterInput } from "../../component/CounterInput"

export const usePerDieBonusInput = () => {
    const [perDieBonus, setPerDieBonus] = useState<number>(0)

    const PerDieBonusInput =
        <CounterInput tooltip={"Adds damage per damage die rolled\n(including exploding dice)"}>
            <Label text={"Per-die Bonus"} />
            <NumericCounterInput value={perDieBonus} onChange={(val) => setPerDieBonus(Math.max(0, val))} />
        </CounterInput>

    return { PerDieBonusInput, perDieBonus, setPerDieBonus }
}