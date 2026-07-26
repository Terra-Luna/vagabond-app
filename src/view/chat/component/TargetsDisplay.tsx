import { Trash } from "lucide-react"
import { useContextMenu } from "../../component/ContextMenu"
import { vgLiteLang } from "../../../utils/lang"

export const TargetsDisplay = ({ targets, onRemoveTarget }: { targets: any[], onRemoveTarget: any }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div>
            {
                targets && targets.length > 0 ?
                    <div className="flex flex-wrap -space-x-4 justify-center items-center px-2">
                        <p className="mr-1 text-text-secondary font-paradigm font-normal">Targets: </p>
                        {targets.map((target, index) => (
                            <button
                                key={target.id}
                                title={target.token?.name}
                                onClick={() => {
                                    target.token?.control({ releaseOthers: true })
                                    canvas?.animatePan({
                                        x: target.token?.center.x,
                                        y: target.token?.center.y
                                    })
                                }}
                                onContextMenu={(e) => onCtxMenu(e, [
                                    { icon: Trash, label: vgLiteLang.ButtonActions.remove, action: () => onRemoveTarget(index), isDestructive: true }
                                ])}
                                children={
                                    <img
                                        src={target.src}
                                        alt={target.token?.name}
                                        className={`object-contain h-[38px] w-[38px] cursor-pointer`}
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