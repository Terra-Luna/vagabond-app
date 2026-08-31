import { useContextMenu } from "../../../../component/ContextMenu"
import { EditableNameField } from "../../../../component/EditableTextField"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { useImageEdit } from "../../../shared/ImageEditUseCase"

export const ItemActorSheetComponent = ({ actor }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(actor)

    return (
        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            <div title="R-click for optons" className="h-full bg-sheet-header-fill border-solid border-table-border" onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
                <div className="text-2xl text-text-header-primary font-eskapade font-bold p-2">
                    <EditableNameField actor={actor} />
                </div>
                <img
                    src={actor.img} alt={actor.name}
                    className={`border border-solid border-black/5 object-fill`}
                />
                <ContextMenu />
            </div>
        </EditModeContextProvider>
    )
}