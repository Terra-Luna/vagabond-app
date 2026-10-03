import { useState } from "react"

import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { Label } from "../../component/Labels"

export const usePerDieBonusInput = () => {
    const [perDieBonus, setPerDieBonus] = useState<number>(0)

    const PerDieBonusInput =
        <div title={"Adds damage per damage die rolled\n(including exploding dice)"} className="relative flex items-center">
            <Label text="Per-die Bonus" className="pointer-events-none absolute left-1 top-1 z-10 max-w-[8ch] leading-3 text-sm" />
            <NumericCounterInput
                value={perDieBonus}
                onChange={(val) => setPerDieBonus(Math.max(0, val))}
                width="max-w-[8ch] font-bold text-lg"
            />
        </div>

    return { PerDieBonusInput, perDieBonus, setPerDieBonus }
}