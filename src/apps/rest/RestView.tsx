import { BottleWine, Soup, XSquareIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { tableBorderRounded } from "../../view/common/border-styles"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { DropDown } from "../../view/component/Dropdown"
import { Header } from "../../view/component/Header"
import { LabelledField } from "../../view/component/LabelledField"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { isRation, LodgingTypes } from "./RestUtils"

const getLodgingTypeCost = (lodging: keyof typeof LodgingTypes) => {
    return " (" + LodgingTypes[lodging] + appLang.Rest.lodgingCostSuffix + ")"
}

const LodgingOptions = [
    { label: appLang.Rest.lodging.horrible + getLodgingTypeCost('horrible'), value: 'horrible' },
    { label: appLang.Rest.lodging.poor + getLodgingTypeCost('poor'), value: 'poor' },
    { label: appLang.Rest.lodging.modest + getLodgingTypeCost('modest'), value: 'modest' },
    { label: appLang.Rest.lodging.comfortable + getLodgingTypeCost('comfortable'), value: 'comfortable' },
    { label: appLang.Rest.lodging.luxury + getLodgingTypeCost('luxury'), value: 'Luxury' },
    { label: appLang.Rest.lodging.opulent + getLodgingTypeCost('opulent'), value: 'opulent' },
    { label: appLang.Rest.lodging.none + getLodgingTypeCost('none'), value: 'none' },
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
                    <Header title={appLang.Rest.breather} />
                    <div className={`text-lg text-center flex flex-col h-full`}>
                        <span className="px-2">
                            {localizeString(appLang.Rest.breatherDescription, { might: actor.system.stats.might?.toString() ?? "0" })}
                        </span>
                        <div className="flex w-full justify-center relative top-2">
                            <Soup size={64} strokeWidth={1} /><BottleWine size={64} strokeWidth={1} />
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-center">
                                <PrimaryButton onClick={takeABreather} disabled={!!downTimeActionTaken}>
                                    {downTimeActionTaken === "breather" ? appLang.Rest.breatherComplete : appLang.Rest.takeBreather}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <Header title={appLang.Rest.rest} />
                    <div className={`text-lg text-center flex flex-col h-full`}>
                        <span className="px-2">
                            {appLang.Rest.restDescription}
                        </span>
                        <div className="pt-2">
                            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                <LabelledField label={appLang.Rest.lodgingQuality}>
                                    <DropDown value={lodging} options={LodgingOptions}
                                        updateMechanism={{ onChange: (val) => setLodging(val) }} />
                                </LabelledField>
                            </EditModeContextProvider>
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-center">
                                <PrimaryButton onClick={takeARest} disabled={!!downTimeActionTaken}>
                                    {downTimeActionTaken === "rest" ? appLang.Rest.restComplete : appLang.Rest.takeRest}
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
                <SecondaryButton onClick={onCancel}>{appLang.ButtonActions.close}</SecondaryButton>
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
        {appLang.Rest.noRationFound}
    </div>
}