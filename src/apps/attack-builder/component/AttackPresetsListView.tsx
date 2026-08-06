import { Plus } from "lucide-react"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { PrimaryButton } from "../../../view/component/Button"
import { TrashButton } from "../../../view/component/TrashButton"
import { AttackPreset, AttackBuilderApp } from "../AttackBuilderApp"
import { useDeletePreset } from "../usecase/preset/DeletePresetUseCase"
import { AttackPresetRow } from "./AttackPresetRow"
import { useEditPreset } from "../usecase/preset/EditPresetUseCase"
import { EditButton } from "../../../view/component/EditButton"
import { vgLiteLang } from "../../../utils/lang"
import { CollapsibleSection } from "../../../view/component/Collapsible"

export const AttackPresetsListView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const presets = actor.getFlag("vagabond-lite" as any, "attackPresets" as any) as AttackPreset[] ?? []
    const { editPreset } = useEditPreset(actor)
    const { deletePreset } = useDeletePreset(actor)

    return (
        <div className="flex flex-col">
            <CollapsibleSection title={"PRESETS"} content={<>
                <div className="border border-solid border-table-border border-t-0 rounded-b-sm">
                    {presets.map((preset, index) => (
                        <div key={index} className="w-full even:bg-table-row-even/50 odd:bg-table-row-odd/50">
                            <AttackPresetRow
                                actor={actor}
                                key={index}
                                preset={preset}
                                EditButton={<EditButton onEdit={() => editPreset(preset)} />}
                                TrashButton={<TrashButton onDelete={() => deletePreset(index)} />}
                            />
                        </div>
                    ))}
                </div>

                {/* ADD NEW PRESET BUTTON */}
                <div className="w-full flex justify-end mt-1">
                    <PrimaryButton
                        onClick={() => new AttackBuilderApp(actor).render({ force: true })}
                        icon={<Plus size={18} />}
                    >
                        {vgLiteLang.ButtonActions.add}
                    </PrimaryButton>
                </div>

            </>} />

        </div>
    )
}