import { ManaStatSelector, MaxManaPerLevelSelector, SpellcastingSkillSelector, SpellGainLevelInterval, StartingSpellSlotsInput } from "./component/SpellcastingConfig"
import { ClassDataModel } from "../../../../../model/item/character/ClassDataModel"
import { EditableTextField } from "../../../../component/EditableTextField"
import { Divider } from "../../../../component/Header"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { Description } from "../../../shared/Description"
import { BaseItemSheetComponent } from "../../shared/BaseItemSheetComponent"
import { ItemPortraitComponent } from "../../shared/ItemPortraitComponent"
import { ClassFeaturesConfig } from "./component/ClassFeaturesConfig"
import { ComplexityRating } from "./component/ComplexityRating"
import { KeyStatsSelector } from "./component/ClassStatSelector"
import { StartingPackSelector } from "./component/StartingPackSelector"
import { vgLiteLang } from "../../../../../utils/lang"
import { ItemRulesManager } from "../../../../component/rules/ItemRulesManager"

export const ClassSheetReactComponent = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    return (
        <BaseItemSheetComponent
            banner={<ClassSheetBanner item={item} />}
            description={<Description item={item} showFullView={true} italic={false} />}
            body={<>
                <ComplexityRating item={item} />
                <StartingPackSelector item={item} />
                <KeyStatsSelector item={item} />
                <SpellcastingSkillSelector item={item} />
                <ManaStatSelector item={item} />
                <MaxManaPerLevelSelector item={item} />
                <StartingSpellSlotsInput item={item} />
                <SpellGainLevelInterval item={item} />
                <ClassFeaturesConfig item={item} />
                <div className="mt-2">
                    <ItemRulesManager item={item} />
                </div>
            </>}
            bodyClassName="flex flex-col m-2"
        />
    )
}

const ClassSheetBanner = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { editModeToggleBtn } = useEditMode()
    return (
        <div>
            <div className="flex items-center px-2 bg-sheet-header-fill">
                <ItemPortraitComponent item={item} size={104} />
                <div className="text-3xl text-text-header-primary font-eskapade font-bold">
                    <EditableTextField
                        boundValue={item.name}
                        updateProps={{ object: item, path: ['name'] }}
                        placeholder={vgLiteLang.ClassSheet.placeholder_classname}
                    />
                </div>
                <Divider />
                {editModeToggleBtn}
            </div>
        </div>
    )
}