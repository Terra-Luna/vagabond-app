import { Tooltip } from "../../../../../../../component/Tooltip"
import { SpellcastingLabel, SpellcastingMana } from "./SpellcastingTypography"

export const TotalMana = ({ cost }: { cost: number }) => {
    return (
        <Tooltip content={`Total Mana:${cost}`}>
            <div className="flex flex-col w-full ml-2 w-[6ch] shrink-0 items-center justify-end pr-2 -mt-2">
                <span className="-mb-3">
                    <SpellcastingLabel text="Cost" />
                </span>
                <SpellcastingMana text={cost} />
            </div>
        </Tooltip>
    )
}