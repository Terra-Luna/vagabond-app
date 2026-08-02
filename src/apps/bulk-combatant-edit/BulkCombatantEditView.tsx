import { Minus, Plus } from "lucide-react"
import { VgLiteCombatant } from "../../combat/documents/VgLiteCombat"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { useCallback } from "react"

export const BulkCombatantEditView = ({ combatants }: { combatants: VgLiteCombatant[] }) => {

    const changeAllCombatantsHp = useCallback((amount: number) => {
        combatants.forEach(comb => {
            comb.actor?.update({system: {health: {current: comb.actor.system.health.current + amount}}})
        })
    }, [combatants])

    return (
        <div className="space-y-4 overflow-auto p-2">
            Work in progress. Click the buttons to raise / lower all combatants HP
            <div className="flex">
                <IconOnlyButton Icon={Plus} onClick={() => changeAllCombatantsHp(1)} />
                <IconOnlyButton Icon={Minus} onClick={() => changeAllCombatantsHp(-1)} />
            </div>
        </div>
    )
}
