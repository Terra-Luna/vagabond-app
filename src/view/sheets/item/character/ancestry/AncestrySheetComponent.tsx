import { AncestryDataModel } from "../../../../../model/item/character/AncestryDataModel"
import { createDropdownEntries } from "../../../../../utils/localeUtils"
import { DropDown } from "../../../../component/Dropdown"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { lang } from "../../../../../utils/lang"
import { BaseItemSheetComponent } from "../../shared/BaseItemSheetComponent"
import { ItemSheetBanner } from "../../shared/ItemSheetBanner"
import { ItemRulesManager } from "../../../../../rules/ItemRulesManager"
import { Description } from "../../../shared/Description"
import { useImageEdit } from "../../../shared/ImageEditUseCase"
import { useContextMenu } from "../../../../component/ContextMenu"

export const AncestryReactComponent = ({ item }: { item: Item & { system: AncestryDataModel } | null }) => {
    if (!item) return
    const { isEditMode } = useEditMode()
    const { ContextMenu, onCtxMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(item)

    const ancestry = item.system

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* STORYBOOK IMAGE */}
            <div className="w-1/3 sticky top-0 flex justify-start items-start" onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
                <img src={item.img ?? ''} className="w-full object-contain" />
                <ContextMenu />
            </div>

            {/* ITEM SHEET - SCROLLABLE */}
            <div className="w-2/3 h-full overflow-y-auto">
                <BaseItemSheetComponent
                    bodyClassName="mt-2 mx-2 pb-10"
                    banner={<ItemSheetBanner item={item} hideImage={true} />}
                    description={<Description item={item} showFullView={true} italic={false} />}
                    body={
                        <>
                            {isEditMode && (
                                <div className="text-header-text-secondary flex gap-2 mb-2">
                                    <DropDown
                                        label={lang.VGLITE.ItemSheet.size}
                                        variant="alternate"
                                        options={createDropdownEntries(lang.VGLITE.Sizes)}
                                        parent={ancestry.parent}
                                        updateMechanism={{ updatePath: ['beingSize'] }}
                                        value={ancestry.beingSize ?? ''}
                                    />
                                    <DropDown
                                        label={lang.VGLITE.ItemSheet.type}
                                        variant="alternate"
                                        options={createDropdownEntries(lang.VGLITE.BeingTypes)}
                                        parent={ancestry.parent}
                                        updateMechanism={{ updatePath: ['beingType'] }}
                                        value={ancestry.beingType}
                                    />
                                </div>
                            )}

                            <ItemRulesManager item={item} />
                        </>
                    }
                />
            </div>
        </div>
    )
}