import { Eye, Heart, HeartMinusIcon, HeartPlusIcon, Minus, Plus, Trash } from "lucide-react"
import { VagabondCombatant } from "../../combat/documents/VagabondCombat"
import { useCallback, useState } from "react"
import { Widget } from "../../view/component/Widget"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { ActorDataModel, BaseActorSchema } from "../../model/actor/ActorDataModel"
import { buttonAnimation } from "../../view/component/Button"
import { getControlledTokens } from "../../combat/combat-utils"
import { useContextMenu } from "../../view/component/ContextMenu"

export const BulkCombatantEditView = ({ combatants }: { combatants: VagabondCombatant[] }) => {

    const enabled = combatants.length > 0

    const [hpToAddOrRemove, setHpToAddOrRemove] = useState(1)
    const [mode, setMode] = useState<'subtr' | 'add'>('subtr')

    const changeAllCombatantsHp = useCallback(async () => {
        await Promise.all(combatants
            .filter(c => c.token?.actor)
            .map(c => {
                const currentHp = (c.token?.actor?.system as ActorDataModel<BaseActorSchema>).health.current ?? 0
                return c.token?.actor?.update({ system: { health: { current: currentHp + (hpToAddOrRemove * (mode === 'add' ? 1 : -1)) } } })
            }))
    }, [combatants, mode, hpToAddOrRemove])

    const { onCtxMenu, ContextMenu } = useContextMenu()

    const updateVisibility = () => getControlledTokens().forEach(token => token.document.update({ hidden: !token.document.hidden }))

    const ctxMenuActions = () => {
        const actions = [
            { label: "Toggle Visibility of Selected Tokens", action: updateVisibility, icon: Eye },
            { label: "Remove all", action: () => game.combat?.deleteEmbeddedDocuments("Combatant", combatants.map(c => c.id!)), icon: Trash, isDestructive: true }
        ] as any

        return actions
    }

    return (
        <>
            <div className="flex flex-wrap -space-x-4 justify-center items-center px-2" onContextMenu={enabled ? e => onCtxMenu(e, ctxMenuActions()) : undefined}>
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
                <ContextMenu />
            </div>
            <Widget label="Edit Combatant Hp">
                <div className="text-text-primary font-eskapade">
                    Edit Combatant Hp
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center border border-solid border-table-border rounded-md cursor-pointer h-full w-full" onClick={() => setMode(mode === 'add' ? 'subtr' : 'add')}>
                            <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-l-md ${mode === 'add' ? 'bg-ic-luck/50' : 'bg-sheet-main-fill'}`}>+</div>
                            <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-r-md ${mode === 'add' ? 'bg-sheet-main-fill' : 'bg-destructive-action/50'}`}>-</div>
                        </div>
                        <div className="flex items-end text-3xl text-text-primary
                                border border-solid border-table-border rounded-sm p-1">
                            <input
                                className="w-16 mr-1 hover-glow"
                                value={hpToAddOrRemove}
                                placeholder="0"
                                type="number"
                                onChange={(e) => {
                                    setHpToAddOrRemove(Number(e.target.value))
                                }}
                            />
                            {mode === "add" ? <HeartPlusIcon className="fill-text-hp-current hover-glow" size={36} onClick={changeAllCombatantsHp} />
                                : <HeartMinusIcon className="fill-text-hp-current hover-glow" size={36} onClick={changeAllCombatantsHp} />}
                        </div>
                    </div>
                </div>
            </Widget>
        </>
    )
}
