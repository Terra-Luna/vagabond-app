import { ReactNode, useCallback, useMemo, useState } from "react"
import { NavigationContext } from "../../../../../context/EditModeContext/Hooks"
import { MoveLeft, MoveRight } from "lucide-react"
import { vgLiteLang } from "../../../../../../utils/lang"
import { PrimaryButton, SecondaryButton } from "../../../../../component/Button"

export const NavigationContextProvider = ({ children }: { children: ReactNode }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [totalSteps, setTotalSteps] = useState(1)

    const onNext = useCallback(() => {
        setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))
    }, [currentStep])

    const onBack = useCallback(() => {
        setCurrentStep(Math.max(0, currentStep - 1))
    }, [currentStep])

    const backButton =
        <SecondaryButton children={
            <div className="flex items-center gap-x-2">
                <MoveLeft size={14} />
                {vgLiteLang.ButtonActions.back}
            </div>
        } onClick={onBack} />

    const nextButton =
        <PrimaryButton children={
            <div className="flex items-center gap-x-2">
                {vgLiteLang.ButtonActions.next}
                <MoveRight size={14} />
            </div>
        } onClick={onNext} />

    const contextValue = useMemo(() => ({
        currentStep, setTotalSteps, onNext, onBack, backButton, nextButton
    }), [onNext, onBack, currentStep, backButton, nextButton])

    return <NavigationContext.Provider value={contextValue} children={children} />
}