import { MoveLeft, MoveRight } from "lucide-react"
import { vgLiteLang } from "../../../../../../utils/lang"
import { SecondaryButton, PrimaryButton } from "../../../../../component/Button"
import { ReactNode } from "react"

export const useNavButtons = (onBack, onNext) => {
    const NavButtons = ({ header }: { header: ReactNode }) => {
        return(
            <div className="flex gap-x-2 justify-between">
                <SecondaryButton children={
                    <div className="flex items-center gap-x-2">
                        <MoveLeft size={14} />
                        {vgLiteLang.ButtonActions.back}
                    </div>
                } onClick={onBack} />

                {header}

                <PrimaryButton children={
                    <div className="flex items-center gap-x-2">
                        {vgLiteLang.ButtonActions.next}
                        <MoveRight size={14} />
                    </div>
                } onClick={onNext} />
            </div>
        )
    }

    return { NavButtons }
}