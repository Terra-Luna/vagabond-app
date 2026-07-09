import { Trash } from "lucide-react"
import { useContextMenu } from "../../component/ContextMenu"
import { Tooltip } from "../../component/Tooltip"
import { vgLiteLang } from "../../../utils/lang"

export const TargetsDisplay = ({ targets, onRemoveTarget }: { targets: any[], onRemoveTarget: any }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div>
            {
                targets.length > 0 ?
                    <div className="flex flex-wrap -space-x-4 justify-center items-center px-2">
                        <p className="mr-1 text-text-secondary font-paradigm font-normal">Targets: </p>
                        {targets.map((target, index) => (
                            <Tooltip key={target.id} text={target.token?.name} children={
                                <img
                                    src={target.src}
                                    alt={target.token?.name}
                                    className={`object-contain h-[38px] w-[38px] cursor-pointer`}
                                    onContextMenu={(e) => onCtxMenu(e, [
                                        { icon: Trash, label: vgLiteLang.ButtonActions.remove, action: () => onRemoveTarget(index), isDestructive: true }
                                    ])}
                                    onClick={() => {
                                        target.token?.control({ releaseOthers: true })
                                        canvas?.animatePan({
                                            x: target.token?.center.x,
                                            y: target.token?.center.y
                                        })
                                    }}
                                />
                            } />
                        ))}
                    </div> : <></>
            }
            {
                game.user?.isGM ? <ContextMenu /> : <></>
            }
        </div>
    )
}