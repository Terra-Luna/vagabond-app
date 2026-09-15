import { ExternalLink, Trash } from "lucide-react"
import { useEffect } from "react"

import { openItemSheet } from "../../../../../model/actor/type/Inventory"
import { ClassDataModel } from "../../../../../model/item/character/ClassDataModel"
import { ItemRulesManager } from "../../../../../rules/ItemRulesManager"
import { ItemsCache } from "../../../../../rules/util/ItemsCache"
import { appLang } from "../../../../../utils/lang"
import { useContextMenu } from "../../../../component/ContextMenu"
import { EditableTextField } from "../../../../component/EditableTextField"
import { Divider, ItemDivider } from "../../../../component/Header"
import { EditModeContextProvider } from "../../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../../context/EditModeContext/EditModeOptions"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { Description } from "../../../shared/Description"
import { useImageEdit } from "../../../shared/ImageEditUseCase"
import { BaseItemSheetComponent } from "../../shared/BaseItemSheetComponent"
import { FeatureSheetComponent } from "../skills/FeatureSheetComponent"
import { ClassSheetBannerWrapper } from "./component/ClassSheetBannerWrapper"
import { KeyStatsSelector } from "./component/ClassStatSelector"
import { ComplexityRating } from "./component/ComplexityRating"
import { StartingPackSelector } from "./component/StartingPackSelector"

export const ClassSheetComponent = ({ item, setFeatureDropEnabled }: { item: Item & { system: ClassDataModel }, setFeatureDropEnabled?: (enabled: boolean) => void }) => {
    const { ContextMenu, onCtxMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(item)
    const { isEditMode } = useEditMode()

    useEffect(() => {
        setFeatureDropEnabled?.(isEditMode && Boolean(game.user?.isActiveGM))
        return () => setFeatureDropEnabled?.(false)
    }, [isEditMode, setFeatureDropEnabled])

    return (
        <div className="@container w-full h-full">
            <div className="flex flex-col @4xl:flex-row h-full w-full overflow-hidden">

                {/* STORYBOOK IMAGE */}
                <div className="hidden @4xl:flex @4xl:w-1/3 @4xl:sticky top-0 justify-start items-start -mt-1" onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
                    <img src={item.img ?? ''} className="w-full object-contain" />
                </div>

                {/* ITEM SHEET */}
                <div className="w-full @4xl:w-1/3 h-full overflow-y-auto">
                    <BaseItemSheetComponent
                        banner={<ClassSheetBanner item={item} />}
                        description={<Description item={item} showFullView={true} italic={false} />}
                        body={<>
                            <KeyStatsSelector item={item} />
                            <ComplexityRating item={item} />
                            <StartingPackSelector item={item} />

                            <div className="mt-2" />
                            <ItemDivider />
                            <div className="mb-1" />

                        </>}
                        bodyClassName="flex flex-col m-2"
                    />

                    <div className="mt-2">
                        <ItemRulesManager item={item} />
                    </div>
                </div>

                {/* CLASS FEATURES */}
                <div className="w-full @4xl:w-1/3 h-full px-0.5 pb-4 space-y-1 overflow-y-auto">
                    <div className="flex items-center px-2 py-3 text-xl text-text-header-primary font-eskapade text-center bg-sheet-header-fill">
                        <Divider />
                        {appLang.ClassSheet.labelClassFeat}
                        <Divider />
                    </div>
                    <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
                        {item.system.featureIds
                            .map(featureId => ItemsCache.items.get(featureId))
                            .filter(feature => feature?.type === "feature")
                            .sort((a, b) => a.system.level - b.system.level)
                            .map(feature => (
                                <div key={feature.uuid} className="mb-1" onContextMenu={event => {
                                    if (!isEditMode) return
                                    onCtxMenu(event, [{
                                        icon: ExternalLink,
                                        label: "Open Feature",
                                        action: () => openItemSheet(feature)
                                    }, {
                                        icon: Trash,
                                        label: "Delete Feature",
                                        isDestructive: true,
                                        action: async () => {
                                            await item.update({
                                                "system.featureIds": item.system.featureIds.filter(featureId => featureId !== feature.uuid)
                                            } as Record<string, any>)
                                            item.render(false)
                                        }
                                    }])
                                }}>
                                    <FeatureSheetComponent item={feature as Item & { system: any }} className={item.name} />
                                </div>
                            ))
                        }
                    </EditModeContextProvider>

                    {isEditMode && game.user?.isActiveGM &&
                        <div data-feature-drop-target="true" className={`p-8 mt-1 text-base text-text-primary text-center font-paradigm italic bg-context-menu-fill border border-dashed border-table-border rounded`}>
                            Drag & Drop here to add Features...
                        </div>
                    }

                </div>
            </div>
            <ContextMenu />
        </div>
    )
}

const ClassSheetBanner = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { editModeToggleBtn } = useEditMode()
    return (
        <ClassSheetBannerWrapper editModeToggleBtn={editModeToggleBtn}>
            <EditableTextField
                boundValue={item.name}
                updateProps={{ object: item, path: ['name'] }}
                placeholder={appLang.ClassSheet.placeholder_classname}
            />
        </ClassSheetBannerWrapper>
    )
}