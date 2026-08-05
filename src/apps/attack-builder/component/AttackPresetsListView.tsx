import { Plus } from "lucide-react";
import { HeroDataModel } from "../../../model/actor/HeroDataModel";
import { PrimaryButton } from "../../../view/component/Button";
import { Header } from "../../../view/component/Header";
import { TrashButton } from "../../../view/component/TrashButton";
import { AttackPreset, AttackBuilderApp } from "../AttackBuilderApp";
import { useDeletePreset } from "../usecase/preset/DeletePresetUseCase";
import { AttackPresetRow } from "./AttackPresetRow";

export const AttackPresetsListView = ({ actor }: { actor: Actor & { system: HeroDataModel }}) => {
    const presets = actor.getFlag("vagabond-lite" as any, "attackPresets" as any) as AttackPreset[] ?? []
    const { deletePreset } = useDeletePreset(actor)

    return (
        <div className="flex flex-col pb-24">
            <Header title={"ATTACKS"} />
            {presets.map((preset, index) => (
                <AttackPresetRow
                    actor={actor}  
                    key={index}
                    preset={preset}
                    TrashButton={<TrashButton onDelete={() => deletePreset(index)} />}
                />
            ))}
            <div className="w-full flex justify-end mt-2">
                <PrimaryButton onClick={() => new AttackBuilderApp(actor).render({ force: true })} icon={<Plus size={18} />}>
                    New Attack
                </PrimaryButton>
            </div>
        </div>
    )
}