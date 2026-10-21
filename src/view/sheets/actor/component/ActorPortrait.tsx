import { ActorDataModel, BaseActorSchema } from "../../../../model/actor/ActorDataModel"
import { PolymorphFlag } from "../../../../model/actor/type/PolymorphFlag"
import { sys_id } from "../../../../utils/foundryUtils"
import { useContextMenu } from "../../../component/ContextMenu"
import { useImageEdit } from "../../shared/ImageEditUseCase"
import { ACTOR_PORTRAIT_HEIGHT, ACTOR_PORTRAIT_WIDTH, defaultPortraitFrame, PortraitFrameData, portraitFrameFlag, portraitFrameImageStyle, useImageAspect } from "./PortraitFrame"


/**
 * The size of this portrait is goverened by the PortraitAdjustApp and some flags  saved on the Actor.
 */
export const ActorPortrait = ({ actor }: { actor: ActorDataModel<BaseActorSchema> }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(actor.parent)

    const { aspect, onLoad } = useImageAspect()
    const frame = (actor.parent.getFlag(sys_id, portraitFrameFlag) as PortraitFrameData | undefined) ?? defaultPortraitFrame

    const polymorph = actor.parent.getFlag(sys_id, "polymorph") as PolymorphFlag | undefined

    return (
        <div onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
            <div className="relative overflow-hidden shrink-0 bg-sheet-header-fill/50 border-r border-l border-b border-solid border-sheet-header-fill"
                style={{ width: ACTOR_PORTRAIT_WIDTH, height: ACTOR_PORTRAIT_HEIGHT }}
            >
                <img
                    src={actor.parent.img} alt={actor.parent.name}
                    onLoad={onLoad}
                    style={portraitFrameImageStyle(frame, aspect)}
                />
                {polymorph && (
                    <img
                        src={polymorph.statBlock.img}
                        alt="Polymorph"
                        className="absolute -bottom-2 -right-2 w-full h-full rounded-full"
                        style={{ width: ACTOR_PORTRAIT_WIDTH / 1.2, height: ACTOR_PORTRAIT_WIDTH / 1.2 }}
                    />
                )}
            </div>
            <ContextMenu />
        </div>
    )
}