import { MoveLeft, MoveRight } from "lucide-react"

import { vgLiteLang } from "../../../utils/lang"
import { PrimaryButton,SecondaryButton } from "../../component/Button"
import { useNavigation } from "./NavigationContext"

export const NavigationButtons = () => {
    const { isFirstStep, isLastStep, onNext, onBack, onFinish } = useNavigation()

    return (
        <div className="flex items-center gap-x-4">
            {!isFirstStep && (
                <SecondaryButton onClick={onBack}>
                    <div className="flex items-center gap-x-2">
                        <MoveLeft size={14} />
                        {vgLiteLang.ButtonActions.back}
                    </div>
                </SecondaryButton>
            )}

            <PrimaryButton onClick={isLastStep ? onFinish : onNext}>
                <div className="flex items-center gap-x-2">
                    {isLastStep ? vgLiteLang.ButtonActions.finish : vgLiteLang.ButtonActions.next}
                    <MoveRight size={14} />
                </div>
            </PrimaryButton>
        </div>
    )
}