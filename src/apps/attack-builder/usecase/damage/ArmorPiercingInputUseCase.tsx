import { ShieldBan } from "lucide-react"
import { NumericCounterInput } from "../../../../view/component/EditableTextField"
import { useState } from "react"
import { CounterInput } from "../../component/CounterInput"

export const useArmorPiercingInput = () => {
    const [armorPiercing, setArmorPiercing] = useState<number>(0)

    const ArmorPiercingInput =
        <CounterInput tooltip={"Ignore target Armor"}>
            <ShieldBan size={18} className="text-text-primary mb-0.5" />
            <NumericCounterInput value={armorPiercing} onChange={(val) => setArmorPiercing(Math.max(0, val))} />
        </CounterInput>

    return { ArmorPiercingInput, armorPiercing, setArmorPiercing }
}