import { useCallback, useEffect, useState } from "react"
import { AncestryDataModel, getAncestryTrainingOptions } from "../../../../../../model/item/character/AncestryDataModel"
import { ClassDataModel, getClassGrantedTrainings, getClassTrainingOptions } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Header } from "../../../../../component/Header"
import { useNavButtons } from "../../../../../context/navigation/NavButtons"
import { BorderedContent } from "../component/BorderedContent"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { Checkbox } from "../../../../../component/Checkbox"

export const useTrainingSelection = (ancestry: AncestryDataModel | undefined, clazz: ClassDataModel | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons, setCanProceed } = useNavButtons()

    const grantedTrainings = getClassGrantedTrainings(clazz)
    const classTraingOpts = getClassTrainingOptions(clazz)
    const [classTrainingSlots, setClassTrainingSlots] = useState(classTraingOpts.count)
    const [selectedClassTrainings, setSelectedClassTrainings] = useState<string[]>([])

    const ancestryTrainingOpts = getAncestryTrainingOptions(ancestry)
    const [ancestryTrainingSlots, setAncestryTrainingSlots] = useState(ancestryTrainingOpts.count)
    const [selectedAncestryTrainings, setSelectedAncestryTrainings] = useState<string[]>([])

    useEffect(() => {
        setClassTrainingSlots(classTraingOpts.count)
        setAncestryTrainingSlots(ancestryTrainingOpts.count)
    }, [classTraingOpts, ancestryTrainingOpts])

    useEffect(() => {
        setCanProceed(
            classTrainingSlots === selectedClassTrainings.length &&
            ancestryTrainingSlots === selectedAncestryTrainings.length
        )
    }, [classTrainingSlots, selectedClassTrainings, ancestryTrainingSlots, selectedAncestryTrainings])

    const onClassSkillTrainingSelected = useCallback((isChecked: boolean, skill: string) => {
        if (isChecked && selectedClassTrainings.length < classTrainingSlots) {
            setSelectedClassTrainings([...selectedClassTrainings, skill])
        }
        else {
            setSelectedClassTrainings([...selectedClassTrainings.filter(t => t !== skill)])
        }
    }, [classTrainingSlots, selectedClassTrainings])

    const onAncestrySkillTrainingSelected = useCallback((isChecked: boolean, skill: string) => {
        if (isChecked && selectedAncestryTrainings.length < ancestryTrainingSlots) {
            setSelectedAncestryTrainings([...selectedAncestryTrainings, skill])
        }
        else {
            setSelectedAncestryTrainings([...selectedAncestryTrainings.filter(t => t !== skill)])
        }
    }, [ancestryTrainingSlots, selectedAncestryTrainings])

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
                                    {selectedClassTrainings.length} / {classTrainingSlots} {strings.selected}
                                </span>
                            </div>
                        </div>
                    </BorderedContent>

                    {/* GRANTED TRAININGS HUD */}
                    <BorderedContent>
                        <div className="space-y-2">
                            <HeroCreationLabel text={strings.grantedTraining} />
                            <div className="flex flex-wrap justify-center gap-2">
                                {
                                    grantedTrainings.map((t, index) => (
                                        <div key={index} className="text-xl font-eskapade font-bold border border-solid border-table-border rounded-md p-2">
                                            {vgLiteLang.Skills[t].name}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </BorderedContent>

                    {/* ADDT'L CLASS TRAINING SELECTIONS */}
                    <BorderedContent>
                        <div>
                            <HeroCreationLabel text={strings.electiveTraining.replace("%s", classTrainingSlots.toString())} />
                            <div className="flex flex-wrap gap-4">
                                {
                                    classTraingOpts.options.filter(o => !selectedAncestryTrainings.includes(o)).map((skill, index) => (
                                        <Checkbox
                                            key={index}
                                            label={vgLiteLang.Skills[skill].name}
                                            onCheckedChanged={(isChecked) => onClassSkillTrainingSelected(isChecked, skill)}
                                            checked={selectedClassTrainings.includes(skill)}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    </BorderedContent>

                    {/* ANCESTRY TRAINING SELECTIONS */}
                    {
                        ancestryTrainingSlots === 0 ? <></> :
                            <BorderedContent>
                                <div>
                                    <HeroCreationLabel text={strings.ancestralTraining.replace("%s", ancestryTrainingSlots.toString())} />
                                    <div className="flex flex-wrap gap-4">
                                        {
                                            ancestryTrainingOpts.options.filter(o => !selectedClassTrainings.includes(o)).map((skill, index) => (
                                                <Checkbox
                                                    key={index}
                                                    label={vgLiteLang.Skills[skill].name}
                                                    onCheckedChanged={(isChecked) => onAncestrySkillTrainingSelected(isChecked, skill)}
                                                    checked={selectedAncestryTrainings.includes(skill)}
                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            </BorderedContent>
                    }
                </div>
            </div>
        )
    }

    return { TrainingSelection }
}