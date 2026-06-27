import { getTokenImg, getCanvasToken } from "../../../utils/modelUtil"
import { Divider } from "../../component/Header"

export const TargetsDisplay = ({ tokenIds }: { tokenIds: string[] }) => {
    const targets = tokenIds.map(id => (
        { id: id, src: getTokenImg(getCanvasToken(id)) }
    )).filter(it => it.src != null && it.src.length > 0)

    return (<>
        {
            targets.length > 0 ?
                <div className="flex space-x-1 justify-center items-center">
                    {<>
                        <Divider />
                        {targets.map(target => (
                            <img
                                key={target.id}
                                className={`object-contain h-[38px] w-[38px]`}
                                src={target.src}
                                alt={'target'}
                            />
                        ))}
                        <Divider />
                    </>}
                </div> : <></>
        }
    </>)
}