import { ShieldBan } from "lucide-react"
import { useState } from "react"

import { appLang } from "../../../../utils/lang"
import { NumericCounterInput } from "../../../../view/component/EditableTextField"

export const useArmorPiercingInput = () => {
    const [armorPiercing, setArmorPiercing] = useState<number>(0)

    const ArmorPiercingInput =
        <div title={appLang.AttackBuilder.ignoreTargetArmor} className="relative flex items-center">
            <ShieldBan
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-1 text-text-primary"
            />

            <NumericCounterInput
                value={armorPiercing}
                onChange={(val) => setArmorPiercing(Math.max(0, val))}
                width="max-w-[5ch] font-bold text-lg"
            />
        </div>

    return { ArmorPiercingInput, armorPiercing, setArmorPiercing }
}