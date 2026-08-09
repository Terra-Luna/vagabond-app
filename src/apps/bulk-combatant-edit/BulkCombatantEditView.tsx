import { Minus, Plus } from "lucide-react"
import { VgLiteCombatant } from "../../combat/documents/VgLiteCombat"
import { IconOnlyButton } from "../../view/component/IconOnlyButton"
import { useCallback } from "react"
import { Widget } from "../../view/component/Widget"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { ActorDataModel, BaseActorSchema } from "../../model/actor/ActorDataModel"

export const BulkCombatantEditView = ({ combatants }: { combatants: VgLiteCombatant[] }) => {

    const changeAllCombatantsHp = useCallback((amount: number) => {
        const updates = combatants
            .filter(c => c.token?.actor)
            .map(c => {
                const currentHp = (c.token?.actor?.system as ActorDataModel<BaseActorSchema>).health.current ?? 0
                return {
                    _id: c.token?.id,
                    'actorData.system.health.current': currentHp + amount
                }
            })

        canvas?.scene?.updateEmbeddedDocuments("Token", updates)
    }, [combatants])

    return (
        <>
            <div className="flex flex-wrap -space-x-4 justify-center items-center px-2">
                {combatants.map((comb, index) => {
                    const token = getCanvasToken(comb.tokenId)
                    const img = getTokenImg(token)
                    return <img
                        key={index}
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
