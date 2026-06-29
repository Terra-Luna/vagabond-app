import { getTokenImg, getCanvasToken } from "../../../utils/modelUtil"
import { Tooltip } from "../../component/Tooltip"

export const TargetsDisplay = ({ tokenIds }: { tokenIds: string[] }) => {
    const targets = tokenIds.map(id => (
        { id: id, src: getTokenImg(getCanvasToken(id)), token: getCanvasToken(id) }
    )).filter(it => it.src != null && it.src.length > 0)
    return (<>
        {
            targets.length > 0 ?
                <div className="flex flex-wrap -space-x-3 justify-center items-center px-2">
                    {<>
                        <p className="mr-1">Targets: </p>
                        {targets.map(target => (
                            <Tooltip text={target.token?.name} children={
                                <img
                                    key={target.id}
                                    src={target.src}
                                    alt={target.token?.name}
                                    className={`object-contain h-[38px] w-[38px] cursor-pointer`}
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
                    </>}
                </div> : <></>
        }
    </>)
}