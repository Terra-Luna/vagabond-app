import { ManaStatSelector, MaxManaPerLevelSelector, SpellcastingSkillSelector } from "./component/SpellcastingConfig"
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
import { TrainingsConfig } from "./component/TrainingsConfig"

export const ClassSheetReactComponent = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <BaseItemSheetComponent
            banner={<ClassSheetBanner item={item} />}
            description={<Description item={item} showFullView={true} italic={false} />}
            body={<>
                <StartingPackSelector item={item} />
                <KeyStatsSelector item={item} />
                <SpellcastingSkillSelector item={item} />
                <ManaStatSelector item={item} />
                <MaxManaPerLevelSelector item={item} />
                <ComplexityRating item={item} />
                <TrainingsConfig item={item} />
                <ClassFeaturesConfig item={item} />
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
                        placeholder={"New class..."}
                    />
                </div>
                <Divider />
                {editModeToggleBtn}
            </div>
            <div>
                
            </div>
        </div>
    )
}