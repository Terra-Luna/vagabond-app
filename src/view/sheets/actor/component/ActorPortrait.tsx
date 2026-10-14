import { ActorDataModel, BaseActorSchema } from "../../../../model/actor/ActorDataModel"
import { sys_id } from "../../../../utils/foundryUtils"
import { useContextMenu } from "../../../component/ContextMenu"
import { useImageEdit } from "../../shared/ImageEditUseCase"
import { defaultPortraitFrame, PortraitFrameData, portraitFrameFlag, portraitFrameImageStyle, useImageAspect } from "./PortraitFrame"


/**
 * The size of this portrait is goverened by the PortraitAdjustApp and some flags  saved on the Actor.
 */
export const ActorPortrait = ({ actor }: { actor: ActorDataModel<BaseActorSchema> }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(actor.parent)

    const { aspect, onLoad } = useImageAspect()
    const frame = (actor.parent.getFlag(sys_id, portraitFrameFlag) as PortraitFrameData | undefined) ?? defaultPortraitFrame

    return (
        <div onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
            <div className={`relative overflow-hidden h-[160px] w-[110px] bg-black/10 border-r border-b border-solid border-table-border`}>
                <img
                    src={actor.parent.img} alt={actor.parent.name}
                    onLoad={onLoad}
                    style={portraitFrameImageStyle(frame, aspect)}
                />
            </div>
            <ContextMenu />
        </div>
    )
}