import { X } from "lucide-react"

import { ActorDataModel, BaseActorSchema } from "../../../../model/actor/ActorDataModel"
import { PolymorphFlag } from "../../../../model/actor/type/PolymorphFlag"
import { sys_id } from "../../../../utils/foundryUtils"
import { appLang } from "../../../../utils/lang"
import { wealthBorderRounded } from "../../../common/border-styles"
import { useContextMenu } from "../../../component/ContextMenu"
import { IconOnlyButton } from "../../../component/IconOnlyButton"
import { Tooltip } from "../../../component/Tooltip"
import { useImageEdit } from "../../shared/ImageEditUseCase"
import { NpcSheetComponent } from "../npc/component/NpcSheetComponent"
import { ACTOR_PORTRAIT_HEIGHT, ACTOR_PORTRAIT_WIDTH, defaultPortraitFrame, PortraitFrameData, portraitFrameFlag, portraitFrameImageStyle, useImageAspect } from "./PortraitFrame"
import { usePolymorphActor } from "./usePolymorphActor"

/**
 * The size of this portrait is goverened by the PortraitAdjustApp and some flags saved on the Actor.
 */
export const ActorPortrait = ({ actor }: { actor: ActorDataModel<BaseActorSchema> }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(actor.parent)

    const { aspect, onLoad } = useImageAspect()
    const frame = (actor.parent.getFlag(sys_id, portraitFrameFlag) as PortraitFrameData | undefined) ?? defaultPortraitFrame

    const polymorph = actor.parent.getFlag(sys_id, "polymorph") as PolymorphFlag | undefined
    const polymorphActor = usePolymorphActor(polymorph)

    const polymorphImg = polymorph && (
        <div className="">
            <img
                src={polymorph.statBlock.tokenImg}
                alt="Polymorph"
                className={`absolute bottom-0 right-0 w-full h-fullbg-sheet-main-fill p-2 ${wealthBorderRounded} bg-sheet-main-fill`}
                style={{ width: ACTOR_PORTRAIT_WIDTH / 1.33, height: ACTOR_PORTRAIT_WIDTH / 1.33 }}
            />
        </div>
    )

    const polymorphCancelButton = polymorph && (game.user?.isActiveGM || polymorph.casterId === actor.parent.id) && (
        <IconOnlyButton
            Icon={X}
            size={20}
            title={appLang.ButtonActions.cancelPolymorph}
            className="absolute top-1/2 right-1 z-999 mt-2 -mr-0.5"
            colorClassName="text-text-tertiary hover:text-destructive-action"
            onClick={async () => await actor.setPolymorph(undefined)}
        />
    )

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
                {polymorphCancelButton}

                {/* POLYMORPH IMAGE INLAY */}
                {polymorphActor
                    ? <Tooltip content={
                        <div className="flex w-[300px] max-h-[80vh] bg-sheet-main-fill">
                            <NpcSheetComponent actor={polymorphActor} hidePortrait={true} />
                        </div>
                    }>{polymorphImg}</Tooltip>
                    : polymorphImg
                }

            </div>
            <ContextMenu />
        </div>
    )
}