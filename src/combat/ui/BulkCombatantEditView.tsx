import { Eye, HeartMinusIcon, HeartPlusIcon, Trash } from "lucide-react"

import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { tableBorderRounded } from "../../view/common/border-styles"
import { useContextMenu } from "../../view/component/ContextMenu"
import { Header } from "../../view/component/Header"
import { Widget } from "../../view/component/Widget"
import { getControlledTokens } from "../combat-utils"
import { VagabondCombatant } from "../documents/VagabondCombat"
import { useAdjustCombatantHP } from "../engine/usecase/AdjustCombatantHPUseCase"

export const BulkCombatantEditView = ({ combatants }: { combatants: VagabondCombatant[] }) => {

    const enabled = combatants.length > 0
    const { mode, setMode, hpAdjustment, setHpAdjustment, updateHP } = useAdjustCombatantHP(combatants)
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
            <Header title={"GM TOOLS"} />
            <Widget label="Edit Combatant Hp">
                <div className="text-text-primary font-eskapade">
                    Edit Combatant Hp
                    <div className="flex items-center gap-x-2">
                        <div className={`flex items-center cursor-pointer h-full w-full ${tableBorderRounded}`} onClick={() => setMode(mode === 'add' ? 'subtr' : 'add')}>
                            <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-l-md ${mode === 'add' ? 'bg-ic-luck/50' : 'bg-sheet-main-fill'}`}>+</div>
                            <div className={`text-4xl text-text-primary font-eskapade font-bold px-2 rounded-r-md ${mode === 'add' ? 'bg-sheet-main-fill' : 'bg-destructive-action/50'}`}>-</div>
                        </div>
                        <div className={`flex items-end text-3xl text-text-primary ${tableBorderRounded} p-1`}>
                            <input
                                className="w-16 mr-1 hover-glow"
                                value={hpAdjustment}
                                placeholder="0"
                                type="number"
                                onChange={(e) => {
                                    setHpAdjustment(Number(e.target.value))
                                }}
                            />
                            {mode === "add" ? <HeartPlusIcon className="fill-text-hp-current hover-glow cursor-pointer" size={36} onClick={updateHP} />
                                : <HeartMinusIcon className="fill-text-hp-current hover-glow" size={36} onClick={updateHP} />}
                        </div>
                    </div>
                </div>
            </Widget>
        </>
    )
}
