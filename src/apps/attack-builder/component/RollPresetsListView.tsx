import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { UtilityButton } from "../../../view/component/Button"
import { TrashButton } from "../../../view/component/TrashButton"
import { RollBuilderApp } from "../RollBuilderApp"
import { useDeletePreset } from "../usecase/preset/DeletePresetUseCase"
import { RollPresetRow } from "./RollPresetRow"
import { useEditPreset } from "../usecase/preset/EditPresetUseCase"
import { EditButton } from "../../../view/component/EditButton"
import { vgLiteLang } from "../../../utils/lang"
import { CollapsibleSection } from "../../../view/component/Collapsible"
import { RollPreset } from "../model/RollPreset"

export const RollPresetsListView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const presets = actor.getFlag("vagabond-lite" as any, "rollPresets" as any) as RollPreset[] ?? []
    const { editPreset } = useEditPreset(actor)
    const { deletePreset } = useDeletePreset(actor)

    return (
        <div className="flex flex-col">
            <CollapsibleSection title={"PRESETS"} content={<>
                <div className="border border-solid border-table-border border-t-0 rounded-b-sm">
                    {presets.map((preset, index) => (
                        <div key={index} className="w-full even:bg-table-row-even/50 odd:bg-table-row-odd/50">
                            <RollPresetRow
                                actor={actor} preset={preset}
                                EditButton={<EditButton onEdit={() => editPreset(preset)} />}
                                TrashButton={<TrashButton onDelete={() => deletePreset(index)} />}
                            />
                        </div>
                    ))}
                </div>

                {/* ADD NEW PRESET BUTTON */}
                <div className="w-full flex justify-end mt-1">
                    <UtilityButton title="Add new preset" onClick={() => new RollBuilderApp(actor).render({ force: true })}>
                        +{vgLiteLang.ButtonActions.add}
                    </UtilityButton>
                </div>

            </>} />

        </div>
    )
}