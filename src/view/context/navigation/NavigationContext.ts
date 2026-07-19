import { createContext, ReactNode, useContext } from "react"

export interface NavigationContextType {
    stepId: string | undefined
    currentIndex: number
    isFirstStep: boolean
    isLastStep: boolean
    registerStepIds: (steps: string[]) => void
    registerOnFinish: (fn: () => void) => void
    onNext: () => void
    onBack: () => void
    onFinish: () => void
    backButton: ReactNode,
    nextButton: ReactNode
}

export const useNavigation = () => {
    const context = useContext(NavigationContext)
    if (!context) throw new Error('useNavigation must be used within NavigationContextProvider')
    return context
}

/**
 * Navigation Context Provider
 *  >>>  Use next and back functions to increment step counter.
 */
export interface NavigationContextProps {
    stepId: string | undefined
    currentIndex: number
    isFirstStep: boolean
    isLastStep: boolean
    registerStepIds: (ids: string[]) => void
    registerOnFinish: (fn: () => void) => void
    onNext: () => void
    onBack: () => void
    onFinish: () => void
    backButton: ReactNode
    nextButton: ReactNode
}
const DefaultNavigationContextValue: NavigationContextProps = {
    stepId: undefined,
    currentIndex: 0,
    isFirstStep: true,
    isLastStep: false,
    registerStepIds: () => { },
    registerOnFinish: () => { },
    onNext: () => { },
    onBack: () => { },
    onFinish: () => { },
    backButton: null,
    nextButton: null
}
export const NavigationContext = createContext<NavigationContextType | undefined>(undefined)
export const useNavigationContext = () => useContext(NavigationContext)