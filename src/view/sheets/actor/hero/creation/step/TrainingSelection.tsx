import { useEffect, useState } from "react";
import { AncestryDataModel, getAncestryGrantedTrainings } from "../../../../../../model/item/character/AncestryDataModel";
import { ClassDataModel, getClassGrantedTrainings, getClassTrainingOptions } from "../../../../../../model/item/character/ClassDataModel";
import { vgLiteLang } from "../../../../../../utils/lang";
import { Header } from "../../../../../component/Header";
import { useNavButtons } from "../../../../../context/navigation/NavButtons";
import { BorderedContent } from "../component/BorderedContent";
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography";

export const useTrainingSelection = (ancestry: AncestryDataModel | undefined, clazz: ClassDataModel | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const grantedTrainings = getClassGrantedTrainings(clazz)
    const classTraingOpts = getClassTrainingOptions(clazz)
    const { NavButtons, setCanProceed } = useNavButtons()
    const [trainingSlots, setTrainingSlots] = useState(0)
    const [selectedTrainings, setSelectedTrainings] = useState<string[]>([])

    useEffect(() => {
        setCanProceed(false)
        setTrainingSlots(classTraingOpts.count)
    }, [])

    useEffect(() => {
        if (selectedTrainings.length === trainingSlots) {
            setCanProceed(true)
        }
    }, [trainingSlots, selectedTrainings])

    const TrainingSelection = () => {
        return (
            <div className="bg-sheet-main-fill space-y-4">
                {/* HEADER AND NAVIGATION BUTTONS */}
                <NavButtons header={<Header title={strings.traingingsHeader} />} />

                <div className="items-center justify-center text-center w-full space-y-2">
                    <HeroCreationSubtext text={strings.trainingSubheader} />
                    
                    {/* PERK SLOTS TRACKER */}
                    <BorderedContent>
                        <div className="flex-col">
                            <HeroCreationSubtext text={`${strings.trainingSlots}`} />
                            <div className="flex gap-x-1 w-full justify-center">
                                <span className="text-3xl text-text-header-tertiary font-eskapade font-bold">
                                    {selectedTrainings.length} / {trainingSlots} {strings.selected}
                                </span>
                            </div>
                        </div>
                    </BorderedContent>

                    {/* GRANTED TRAININGS */}
                    <HeroCreationLabel text={strings.grantedTraining} />
                    <div className="flex gap-x-2">
                        {
                            grantedTrainings.map((t, index) => (
                                <BorderedContent key={index}>
                                    {vgLiteLang.Skills[t].name}
                                </BorderedContent>
                            ))
                        }
                    </div>
                </div>

            </div>
        )
    }

    return { TrainingSelection }
}