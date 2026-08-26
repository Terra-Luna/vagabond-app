import { ActorDataModel, BaseActorSchema } from "../../../../model/actor/ActorDataModel"
import { useContextMenu } from "../../../component/ContextMenu"
import { useImageEdit } from "../../shared/ImageEditUseCase"

export const ActorPortrait = ({ actor }: { actor: ActorDataModel<BaseActorSchema> }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(actor.parent)

    return (
        <div onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
            <img
                src={actor.parent.img} alt={actor.parent.name}
                className={`bg-black/5 border border-solid border-black/5 object-contain h-[154px] w-[110px]`}
            />
            <ContextMenu />
        </div>
    )
}