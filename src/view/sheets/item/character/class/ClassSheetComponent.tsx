import { MaxCastFormulaSelector, MaxManaPerLevelSelector, SpellcastingSkillSelector } from "./component/SpellcastingConfig"
import { ClassDataModel } from "../../../../../model/item/character/ClassDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { Description } from "../../../shared/Description"
import { BaseItemSheetComponent } from "../../shared/BaseItemSheetComponent"
import { ClassFeaturesConfig } from "./component/ClassFeaturesConfig"
import { ComplexityRating } from "./component/ComplexityRating"
import { KeyStatsSelector } from "./component/ClassStatSelector"
import { StartingPackSelector } from "./component/StartingPackSelector"
import { vgLiteLang } from "../../../../../utils/lang"
import { ItemRulesManager } from "../../../../../rules/ItemRulesManager"
import { useImageEdit } from "../../../shared/ImageEditUseCase"
import { useContextMenu } from "../../../../component/ContextMenu"
import { ClassSheetBannerWrapper } from "./component/ClassSheetBannerWrapper"

export const ClassSheetComponent = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { ContextMenu, onCtxMenu } = useContextMenu()
    const { imageEditCtxMenuItems } = useImageEdit(item)

    return (
        <div className="@container w-full h-full">
            <div className="flex flex-col @4xl:flex-row h-full w-full overflow-hidden">

                {/* STORYBOOK IMAGE */}
                <div className="hidden @4xl:flex @4xl:w-1/3 @4xl:sticky top-0 justify-start items-start -mt-1" onContextMenu={(e) => onCtxMenu(e, imageEditCtxMenuItems)}>
                    <img src={item.img ?? ''} className="w-full object-contain" />
                    <ContextMenu />
                </div>

                {/* ITEM SHEET */}
                <div className="w-full @4xl:w-1/3 h-full overflow-y-auto">
                    <BaseItemSheetComponent
                        banner={<ClassSheetBanner item={item} />}
                        description={<Description item={item} showFullView={true} italic={false} />}
                        body={<>
                            <ComplexityRating item={item} />
                            <StartingPackSelector item={item} />
                            <KeyStatsSelector item={item} />
                            <SpellcastingSkillSelector item={item} />
                            <MaxCastFormulaSelector item={item} />
                            <MaxManaPerLevelSelector item={item} />
                        </>}
                        bodyClassName="flex flex-col m-2"
                    />
                </div>

                {/* CLASS FEATURES CONFIGURATION */}
                <div className="w-full @4xl:w-1/3 h-full overflow-y-auto">
                    <ClassFeaturesConfig item={item} />
                    <div className="mt-2">
                        <ItemRulesManager item={item} />
                    </div>
                </div>
            </div>
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
                placeholder={vgLiteLang.ClassSheet.placeholder_classname}
            />
        </ClassSheetBannerWrapper>
    )
}