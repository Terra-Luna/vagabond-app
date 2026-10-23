import { useState } from "react"

import { appLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { DestructiveButton, PrimaryButton, SecondaryButton } from "../../../view/component/Button"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (input?: string) => Promise<void> | void
    /** When true, shows a text field; its value is passed to onConfirm. */
    showInput?: boolean
    inputPlaceholder?: string
    inputDefaultValue?: string
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "primary" | "info"
}

export const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = appLang.General.areYouSure,
    description = appLang.General.actionCannotBeUndone,
    confirmText = appLang.General.confirm,
    cancelText = appLang.ButtonActions.cancel,
    variant = "destructive",
    showInput = false,
    inputPlaceholder,
    inputDefaultValue = "",
}: ConfirmModalProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [inputValue, setInputValue] = useState(inputDefaultValue)

    if (!isOpen) return null

    const handleConfirm = async () => {
        try {
            setIsLoading(true)
            await onConfirm(showInput ? inputValue : undefined)
            onClose()
        } catch (error) {
            console.error("Action failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/33 backdrop-blur-sm">
            {/* BLURRED BACKDROP */}
            <div className="absolute inset-0" onClick={isLoading ? undefined : onClose} />

            {/* DIALOG BOX */}
            <div className={`
                relative w-full max-w-md transform overflow-hidden
                rounded-xl bg-sheet-main-fill p-6 text-left align-middle shadow-xl
                transition-all ${tableBorderRounded}
            `}>
                <p className="text-text-primary text-lg font-eskapade font-bold">
                    {title}
                </p>
                <p className="mt-2 text-base text-text-primary font-paradigm font-normal whitespace-pre-line">
                    {description}
                </p>

                {showInput && (
                    <input
                        type="text"
                        autoFocus
                        className={`mt-4 w-full px-2 py-1 text-text-primary font-paradigm ${tableBorderRounded} bg-transparent`}
                        value={inputValue}
                        placeholder={inputPlaceholder}
                        disabled={isLoading}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === "Enter") handleConfirm()
                            else if (e.key === "Escape") onClose()
                        }}
                    />
                )}

                {/* BUTTONS */}
                <div className="mt-6 flex justify-end gap-3 text-text-primary">
                    {variant !== "info" && <SecondaryButton onClick={onClose}>{cancelText}</SecondaryButton>}

                    {variant === "destructive"
                        ? <DestructiveButton onClick={handleConfirm}>{isLoading ? appLang.General.processing : confirmText}</DestructiveButton>
                        : <PrimaryButton onClick={handleConfirm}>{isLoading ? appLang.General.processing : confirmText}</PrimaryButton>
                    }

                </div>
            </div>
        </div>
    )
}