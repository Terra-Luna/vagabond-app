import { PerTargetDelivery } from "../../../../../../../combat/spellcasting/SpellDelivery"
import { vgLiteLang } from "../../../../../../../utils/lang"
import { SpellcastingLabel } from "./SpellcastingTypography"
import { NumericCounterInput } from "../../../../../../component/CounterImput"

export const SpellTargetInput = ({ delivery, onUpdateTargetCount }: {
    delivery: PerTargetDelivery, onUpdateTargetCount: (input: string | null) => Promise<boolean>
}) => {
    return (
        <div className="flex text-center min-w-[3ch]">
            <div className="flex flex-col">
                <SpellcastingLabel text={vgLiteLang.HeroSheet.Magic.labelTargets} />
                <NumericCounterInput value={delivery.targets} onUpdateValue={onUpdateTargetCount} />
            </div>
        </div>
    )
}