import { ReactNode, useCallback, useMemo, useState } from "react"
import { NavigationContext } from "../../../../../context/EditModeContext/Hooks"

export const NavigationContextProvider = ({ children }: { children: ReactNode }) => {
    const [currentStep, setCurrentStep] = useState(0)
    
    const onNext = useCallback(() => {
        setCurrentStep(currentStep + 1)
    }, [currentStep])

    const onBack = useCallback(() => {
        setCurrentStep(Math.max(0, currentStep - 1))
    }, [currentStep])

    const contextValue = useMemo(() => ({
        currentStep, onNext, onBack
    }), [onNext, onBack, currentStep])

    return <NavigationContext.Provider value={contextValue} children={children} />
}