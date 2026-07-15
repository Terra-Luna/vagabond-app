import { ReactNode, useCallback, useMemo, useRef, useState } from "react"
import { NavigationContext } from "../EditModeContext/Hooks"
import { MoveLeft, MoveRight } from "lucide-react"
import { vgLiteLang } from "../../../utils/lang"
import { PrimaryButton, SecondaryButton } from "../../component/Button"

export interface OnFinishHandler { action: () => void }

export const NavigationContextProvider = ({ children }: { children: ReactNode }) => {
    const [stepIds, setStepIds] = useState<string[]>([])
    const [stepId, setStepId] = useState<string>(stepIds[0])
    const [index, setIndex] = useState<number>(0)
    const [onFinishState, setOnFinishState] = useState<OnFinishHandler>({ action: () => { } })

    const registerStepIds = useCallback((steps: string[]) => {
        setStepIds(steps)
        setStepId(steps[0])
    }, [])

    /**
     * Navigation actions...
     */
    const onNext = useCallback(() => {
        const nextIndex = Math.min(stepIds.length - 1, index + 1)
        setIndex(nextIndex)
        setStepId(stepIds[nextIndex])
    }, [stepIds, index])

    const onBack = useCallback(() => {
        const backIndex = Math.max(0, index - 1)
        setIndex(backIndex)
        setStepId(stepIds[backIndex])
    }, [stepIds, index])

    const registerOnFinish = useCallback((fn: () => void) => {
        setOnFinishState({ action: fn })
    }, [])

    /**
     * Navigation buttons...
     */
    const backButton = (index > 0) ?
            <SecondaryButton children={
                <div className="flex items-center gap-x-2">
                    <MoveLeft size={14} />
                    {vgLiteLang.ButtonActions.back}
                </div>
            } onClick={onBack} /> : <></>

    const nextButton =
        <PrimaryButton children={
            <div className="flex items-center gap-x-2">
                {`${index + 1 === stepIds.length ? vgLiteLang.ButtonActions.finish : vgLiteLang.ButtonActions.next}`}
                <MoveRight size={14} />
            </div>
        } onClick={index + 1 === stepIds.length ? () => { onFinishState.action() } : onNext} />

    const contextValue = useMemo(() => ({
        stepId, registerStepIds, registerOnFinish, backButton, nextButton, onFinishState
    }), [stepId, registerStepIds, registerOnFinish, backButton, nextButton, onFinishState])

    return <NavigationContext.Provider value={contextValue} children={children} />
}