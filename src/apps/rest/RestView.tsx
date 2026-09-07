import { XSquareIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { DropDown } from "../../view/component/Dropdown"
import { Header } from "../../view/component/Header"
import { LabelledField } from "../../view/component/LabelledField"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"

export const LodgingTypes = {
    none: 0,
    horrible: 1,
    poor: 2,
    modest: 10,
    comfortable: 20,
    luxury: 40,
    opulent: 100,
} as const

const getLodgingTypeCost = (lodging: keyof typeof LodgingTypes) => {
    return " (" + LodgingTypes[lodging] + "s)"
}

const LodgingOptions = [
    { label: "Horrible" + getLodgingTypeCost('horrible'), value: 'horrible' },
    { label: "Poor" + getLodgingTypeCost('poor'), value: 'poor' },
    { label: "Modest" + getLodgingTypeCost('modest'), value: 'modest' },
    { label: "Comfortable" + getLodgingTypeCost('comfortable'), value: 'comfortable' },
    { label: "Luxury" + getLodgingTypeCost('luxury'), value: 'Luxury' },
    { label: "Opulent" + getLodgingTypeCost('opulent'), value: 'opulent' },
    { label: "None" + getLodgingTypeCost('none'), value: 'none' },
] as { label: string, value: keyof typeof LodgingTypes }[]

export const isRation = (item) => item.name === "Ration" || item.name === "Rations" || item.system.isRation

export const RestView = ({ onCancel, rest, breather, actor }: {
    onCancel: () => void,
    rest: (lodging: keyof typeof LodgingTypes, ration?: any) => void,
    breather: (ration?: any) => Promise<void>,
    actor: Actor & { system: HeroDataModel }
}) => {
    const [rationItem, setRationItem] = useState<any>()
    const [numRations, setNumRations] = useState<any>()
    const [lodging, setLodging] = useState<keyof typeof LodgingTypes>("none")

    const [hasBreathered, setHasBreathered] = useState(false)
    const [hasRested, setHasRested] = useState(false)

    const updateRationInfo = useCallback(() => {
        setTimeout(() => {
            const allRations = actor?.items.filter(isRation) ?? []
            const rationItem = allRations.find(it => it.name.startsWith("Ration")) || allRations[0]
            const numRations = allRations.reduce((sum, it) => sum + ((it.system as any).bulk?.quantity ?? 1), 0)

            setRationItem(rationItem)
            setNumRations(numRations)

        }, 20)
    }, [actor])

    useEffect(() => {
        updateRationInfo()
    }, [updateRationInfo])

    const takeABreather = useCallback(async () => {
        if (!hasBreathered) {
            await breather(rationItem)
            updateRationInfo()
            setHasBreathered(true)
        }
    }, [rationItem, updateRationInfo, hasBreathered])

    const takeARest = useCallback(async () => {
        if (!hasRested) {
            await rest(lodging, rationItem)
            updateRationInfo()
            setHasRested(true)
            setHasBreathered(true)
        }
    }, [rationItem, updateRationInfo, hasRested, lodging])

    return (
        <div>
            <div className="grid grid-cols-2">
                <div className="p-2 pr-6">
                    <Header title="Breather" />
                    <div className={`text-lg text-center`}>
                        Once per shift, eat a ration and drink some water to regain
                        <span className="text-ic-luck"> {actor.system.stats.might} </span>
                        (your MIT) HP.

                        <div>
                            {rationItem ? (
                                <Ration rationItem={rationItem} numRations={numRations} />
                            ) : (
                                <NoRation />
                            )}
                        </div>
                        <div className="flex justify-center py-2">
                            <PrimaryButton onClick={takeABreather} disabled={hasBreathered}>
                                {hasBreathered ? "Ahhhh..." : "Take a Breather"}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
                <div className="p-2 pl-6">
                    <Header title="Rest" />
                    <div className={`text-lg text-center`}>
                        Resting requires lodging and a ration, and recovers all your HP and Mana.
                        <div className="flex flex-col gap-2">
                            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                <LabelledField label="Lodging Quality">
                                    <DropDown value={lodging} options={LodgingOptions}
                                        updateMechanism={{ onChange: (val) => setLodging(val) }} />
                                </LabelledField>
                            </EditModeContextProvider>
                            {rationItem ? (
                                <Ration rationItem={rationItem} numRations={numRations} />
                            ) : (
                                <NoRation />
                            )}
                        </div>
                        <div className="flex justify-center py-2">
                            <PrimaryButton onClick={takeARest} disabled={hasRested}>
                                {hasRested ? "Ahhhh..." : "Take a Rest"}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-2 ml-auto flex justify-end">
                <SecondaryButton onClick={onCancel}>Close</SecondaryButton>
            </div>
        </div>
    )
}

const Ration = ({ rationItem, numRations }) => {
    return <div className="flex p-3 gap-1 text-4xl justify-center items-center">
        <img className="absolute opacity-33" src={rationItem.img} width={64} height={64} />
        <div className="">
            {numRations}
        </div>
        <div className="text-ic-hp">-1</div>
    </div>
}

const NoRation = () => {
    return <div className="flex items-center gap-1 justify-center">
        <XSquareIcon />
        No Ration found!
    </div>
}