import { Minus, Plus } from "lucide-react"
import { VgLiteCombatant } from "../../combat/documents/VgLiteCombat"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { useCallback } from "react"
import { Widget } from "../../view/component/Widget"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"

export const BulkCombatantEditView = ({ combatants }: { combatants: VgLiteCombatant[] }) => {

    const changeAllCombatantsHp = useCallback((amount: number) => {
        combatants.forEach(comb => {
            comb.actor?.update({ system: { health: { current: comb.actor.system.health.current + amount } } })
        })
    }, [combatants])

    return (
        <>
            <div className="flex flex-wrap -space-x-4 justify-center items-center px-2">
                {combatants.map(comb => {
                    const token = getCanvasToken(comb.tokenId)
                    const img = getTokenImg(token)
                    return <img
                        src={img}
                        alt={token?.name}
                        className={`object-contain h-[38px] w-[38px]`}
                    />
                })}
            </div>
            <Widget label="Edit Combatant Hp">
                <div className="flex">
                    <IconOnlyButton Icon={Plus} onClick={() => changeAllCombatantsHp(1)} />
                    <IconOnlyButton Icon={Minus} onClick={() => changeAllCombatantsHp(-1)} />
                </div>
            </Widget>
        </>
    )
}
