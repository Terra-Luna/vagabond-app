import { useState } from "react"

import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { Label } from "../../component/Labels"

export const useFlatModifierInput = () => {
    const [flatModifier, setFlatModifier] = useState<number>(0)

    const FlatModifierInput =
        <div title={"Addt'l flat bonus to damage"} className="relative flex items-center">
            <Label text="Flat Bonus" className="pointer-events-none absolute left-1 top-1 z-10 max-w-[5ch] leading-3 text-sm" />
            <NumericCounterInput
                value={flatModifier}
                onChange={(val) => setFlatModifier(val)}
                width="max-w-[8ch] font-bold text-lg"
            />
        </div>
                
    return { FlatModifierInput, flatModifier, setFlatModifier }
}