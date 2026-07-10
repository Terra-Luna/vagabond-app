import { ReactNode, useCallback, useMemo, useState } from "react"
import { NavigationContext } from "../../../../../context/EditModeContext/Hooks"
import { MoveLeft, MoveRight } from "lucide-react"
import { vgLiteLang } from "../../../../../../utils/lang"
import { PrimaryButton, SecondaryButton } from "../../../../../component/Button"

export interface OnFinishHandler { action: () => void }

export const NavigationContextProvider = ({ children }: { children: ReactNode }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [totalSteps, setTotalSteps] = useState(1)
    const [onFinishState, setOnFinishState] = useState<OnFinishHandler>({ action: () => { } })

    const onNext = useCallback(() => {
        setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))
    }, [currentStep, totalSteps])

    const onBack = useCallback(() => {
        setCurrentStep(Math.max(0, currentStep - 1))
    }, [currentStep])

    const registerOnFinish = useCallback((fn: () => void) => {
        setOnFinishState({ action: fn })
    }, [onFinishState])

    const backButton = currentStep > 0 ?
        <SecondaryButton children={
            <div className="flex items-center gap-x-2">
                <MoveLeft size={14} />
                {vgLiteLang.ButtonActions.back}
            </div>
        } onClick={onBack} /> : <></>

    const nextButton =
        <PrimaryButton children={
            <div className="flex items-center gap-x-2">
                {`${currentStep + 1 === totalSteps ? vgLiteLang.ButtonActions.finish : vgLiteLang.ButtonActions.next}`}
                <MoveRight size={14} />
            </div>
        } onClick={currentStep + 1 === totalSteps ? () => { console.log("Finished...") } : onNext} />

    const contextValue = useMemo(() => ({
        currentStep, setTotalSteps, registerOnFinish, backButton, nextButton
    }), [currentStep, backButton, nextButton, onFinishState, registerOnFinish])

    return <NavigationContext.Provider value={contextValue} children={children} />
}