import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { sys_id } from "../../../utils/foundryUtils"
import { appLang } from "../../../utils/lang"
import { tableBorder } from "../../../view/common/border-styles"
import { CollapsibleSection } from "../../../view/component/Collapsible"
import { EditButton } from "../../../view/component/EditButton"
import { TrashButton } from "../../../view/component/TrashButton"
import { RollPreset } from "../model/RollPreset"
import { RollBuilderApp } from "../RollBuilderApp"
import { useDeletePreset } from "../usecase/preset/DeletePresetUseCase"
import { useEditPreset } from "../usecase/preset/EditPresetUseCase"
import { useReorderPreset } from "../usecase/preset/ReorderPresetUseCase"
import { RollPresetCard } from "./RollPresetCard"

export const RollPresetsListView = ({ actor }: { actor: Actor & { system: HeroDataModel } }) => {
    const presets = actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[] ?? []
    const { editPreset } = useEditPreset(actor)
    const { Confirmation, deletePreset } = useDeletePreset(actor)
    const { dragIndex, onDragStart, onDragEnter, onDrop, onDragEnd } = useReorderPreset(actor)

    return (
        <div className="flex flex-col">
            <CollapsibleSection
                title={"PRESETS"}
                actions={[{
                    label: `+${appLang.ButtonActions.add}`,
                    tooltip: { title: "Roll Presets", content: "Add new custom roll preset." },
                    action: async (e) => { e.stopPropagation(); new RollBuilderApp(actor).render({ force: true }); }
                }]}
                content={<>
                <div className={`${tableBorder} border-t-0 rounded-b-sm`}>
                    {presets.map((preset, index) => (
                        <div
                            key={index}
                            className={`w-full ${index === dragIndex ? "opacity-40" : "even:bg-table-row-even/50 odd:bg-table-row-odd/50"}`}
                            draggable={true}
                            onDragStart={(e) => onDragStart(e, preset, index)}
                            onDragEnter={(e) => onDragEnter(e, index)}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                            onDrop={(e) => onDrop(e, index)}
                            onDragEnd={(e) => onDragEnd(e)}
                        >
                            <RollPresetCard
                                actor={actor} preset={preset}
                                EditButton={<EditButton onEdit={() => editPreset(preset)} />}
                                TrashButton={<TrashButton onClick={() => deletePreset(index)} />}
                            />
                        </div>
                    ))}
                </div>

            </>} />

            {/* DELETE PRESET CONFIRMATION DIALOG */}
            <Confirmation />

        </div>
    )
}