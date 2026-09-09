import { BottleWine, Soup, XSquareIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { tableBorderRounded } from "../../view/common/border-styles"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { DropDown } from "../../view/component/Dropdown"
import { Header } from "../../view/component/Header"
import { LabelledField } from "../../view/component/LabelledField"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { isRation, LodgingTypes } from "./RestUtils"

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

export const RestView = ({ onCancel, rest, breather, actor }: {
    onCancel: () => void,
    rest: (lodging: keyof typeof LodgingTypes, ration?: any) => void,
    breather: (ration?: any) => Promise<void>,
    actor: Actor & { system: HeroDataModel }
}) => {
    const [rationItem, setRationItem] = useState<any>()
    const [numRations, setNumRations] = useState<any>()
    const [lodging, setLodging] = useState<keyof typeof LodgingTypes>("none")

    const [downTimeActionTaken, setDownTimeActionTaken] = useState<false | "rest" | "breather">(false)

    const updateRationInfo = useCallback(() => {
        const allRations = actor?.items.filter(isRation) ?? []
        const rationItem = allRations.find(it => it.name.startsWith("Ration")) || allRations[0]
        const numRations = allRations.reduce((sum, it) => sum + ((it.system as any).bulk?.quantity ?? 1), 0)

        setRationItem(rationItem)
        setNumRations(numRations)
    }, [actor])

    useEffect(() => {
        updateRationInfo()
    }, [updateRationInfo])

    const takeABreather = useCallback(async () => {
        if (!downTimeActionTaken) {
            await breather(rationItem)
            updateRationInfo()
            setDownTimeActionTaken("breather")
        }
    }, [rationItem, updateRationInfo, downTimeActionTaken])

    const takeARest = useCallback(async () => {
        if (!downTimeActionTaken) {
            await rest(lodging, rationItem)
            updateRationInfo()
            setDownTimeActionTaken("rest")
        }
    }, [rationItem, updateRationInfo, downTimeActionTaken, lodging])

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-2 p-2">
                <div>
                    <Header title="Breather" />
                    <div className={`text-lg text-center flex flex-col h-full`}>
                        <span className="px-2">
                            Once per shift, eat a ration and drink some water to regain HP equal to your Might (<span className="text-ic-luck">{actor.system.stats.might}</span>)
                        </span>
                        <div className="flex w-full justify-center relative top-2">
                            <Soup size={64} strokeWidth={1} /><BottleWine size={64} strokeWidth={1} />
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-center">
                                <PrimaryButton onClick={takeABreather} disabled={!!downTimeActionTaken}>
                                    {downTimeActionTaken === "breather" ? "Phew..." : "Take a Breather"}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <Header title="Rest" />
                    <div className={`text-lg text-center flex flex-col h-full`}>
                        <span className="px-2">
                            Resting requires lodging and a ration, and recovers all your HP, Mana, and Luck.
                        </span>
                        <div className="pt-2">
                            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                <LabelledField label="Lodging Quality">
                                    <DropDown value={lodging} options={LodgingOptions}
                                        updateMechanism={{ onChange: (val) => setLodging(val) }} />
                                </LabelledField>
                            </EditModeContextProvider>
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-center">
                                <PrimaryButton onClick={takeARest} disabled={!!downTimeActionTaken}>
                                    {downTimeActionTaken === "rest" ? "ZZZzzz..." : "Take a Rest"}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-2 pt-7 flex justify-between items-end mt-auto">
                <div>
                    <Ration rationItem={rationItem} numRations={numRations} hasRested={!!downTimeActionTaken} />
                </div>
                <SecondaryButton onClick={onCancel}>Close</SecondaryButton>
            </div>
        </div>
    )
}

const Ration = ({ rationItem, numRations, hasRested }) => {
    if (!rationItem) {
        return <NoRation />
    }
    return <div className={`flex gap-1 text-4xl justify-center items-center w-[64px] h-[64px] ${tableBorderRounded}`}>
        <img className="absolute opacity-33" src={rationItem.img} width={64} height={64} />
        <div className="font-eskapade">
            {numRations}
        </div>
        {!hasRested && <div className="text-ic-hp">-1</div>}
    </div>
}

const NoRation = () => {
    return <div className="flex items-center gap-1 justify-center">
        <XSquareIcon />
        No Ration found!
    </div>
}