import { vgLiteLang } from "../../utils/lang"
import { DestructiveButton, PrimaryButton } from "./Button"

export const PopOutWidget = ({ label, children, onSave, onCancel }) => {
    return (
        <div className="absolute top-full right-0">
            <div className="border-2 border-solid border-table-border rounded-md bg-wealth-fill p-2 space-y-4">
                <div className="flex gap-x-2 items-center">
                    {children}
                </div>
                <div className="flex w-full items-center">
                    <p className="text-sm font-eskapade font-normal">{label}</p>
                    <div className="flex gap-x-1 justify-end w-full">
                        <PrimaryButton onClick={onSave}>
                            <p>{vgLiteLang.ButtonActions.save}</p>
                        </PrimaryButton>
                        <DestructiveButton onClick={onCancel}>
                            <p>{vgLiteLang.ButtonActions.cancel}</p>
                        </DestructiveButton>
                    </div>
                </div>
            </div>
        </div>
    )
}