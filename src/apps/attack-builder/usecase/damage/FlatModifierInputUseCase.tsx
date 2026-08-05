import { useState } from "react"
import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { Label } from "../../component/Labels"
import { CounterInput } from "../../component/CounterInput"

export const useFlatModifierInput = () => {
    const [flatModifier, setFlatModifier] = useState<number>(0)

    const FlatModifierInput =
        <CounterInput tooltip={"Addt'l flat bonus to damage"}>
            <Label text={"Flat Modifier"} />
            <NumericCounterInput value={flatModifier} onChange={(val) => setFlatModifier(val)} />
        </CounterInput>
                
    return { FlatModifierInput, flatModifier }
}