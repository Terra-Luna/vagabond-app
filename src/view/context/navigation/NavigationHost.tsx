import { MoveLeft, MoveRight } from 'lucide-react'
import { useState, useCallback, useMemo, ReactNode } from 'react'
import { vgLiteLang } from '../../../utils/lang'
import { SecondaryButton, PrimaryButton } from '../../component/Button'
import { NavigationContext } from './NavigationContext'

export const NavigationHost = ({ children }: { children: ReactNode }) => {
    const [stepIds, setStepIds] = useState<string[]>([])
    const [index, setIndex] = useState<number>(0)
    const [onFinishAction, setOnFinishAction] = useState<() => void>(() => () => { })

    const registerStepIds = useCallback((newSteps: string[]) => {
        setStepIds((prevSteps) => {
            if (JSON.stringify(prevSteps) === JSON.stringify(newSteps)) {
                return prevSteps
            }

            setIndex((prevIndex) => {
                const currentActiveId = prevSteps[prevIndex]
                if (!currentActiveId) return 0
                const newMatchIndex = newSteps.indexOf(currentActiveId)
                return newMatchIndex !== -1 ? newMatchIndex : 0
            })

            return newSteps
        })
    }, [])

    const onNext = useCallback(() => {
        setIndex((prevIndex) => Math.min(stepIds.length - 1, prevIndex + 1))
    }, [stepIds.length])

    const onBack = useCallback(() => {
        setIndex((prevIndex) => Math.max(0, prevIndex - 1))
    }, [])

    const registerOnFinish = useCallback((fn: () => void) => {
        setOnFinishAction(() => fn)
    }, [])

    const onFinish = useCallback(() => {
        onFinishAction()
    }, [onFinishAction])

    const stepId = stepIds[index]
    const isFirstStep = index === 0
    const isLastStep = index === stepIds.length - 1 && stepIds.length > 0

    /**
     * Navigation buttons...
     */
    const backButton = !isFirstStep ? (
        <SecondaryButton onClick={onBack}>
            <div className="flex items-center gap-x-2">
                <MoveLeft size={14} />
                {vgLiteLang.ButtonActions.back}
            </div>
        </SecondaryButton>
    ) : <></>

    const nextButton = (
        <PrimaryButton onClick={isLastStep ? onFinish : onNext}>
            <div className="flex items-center gap-x-2">
                {isLastStep ? vgLiteLang.ButtonActions.finish : vgLiteLang.ButtonActions.next}
                <MoveRight size={14} />
            </div>
        </PrimaryButton>
    )

    const contextValue = useMemo(() => ({
        stepId,
        currentIndex: index,
        isFirstStep,
        isLastStep,
        registerStepIds,
        registerOnFinish,
        onNext,
        onBack,
        onFinish,
        backButton,
        nextButton
    }), [
        stepId, index, isFirstStep, isLastStep, registerStepIds,
        registerOnFinish, onNext, onBack, onFinish, backButton, nextButton
    ])

    return (
        <NavigationContext.Provider value={contextValue}>
            {children}
        </NavigationContext.Provider>
    )
}