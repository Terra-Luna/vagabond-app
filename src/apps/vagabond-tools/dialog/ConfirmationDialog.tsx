import { useState } from "react"

import { tableBorderRounded } from "../../../view/common/border-styles"
import { DestructiveButton, PrimaryButton, SecondaryButton } from "../../../view/component/Button"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "primary"
}

export const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
}: ConfirmModalProps) => {
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        try {
            setIsLoading(true)
            await onConfirm()
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
                <p className="text-text-primary text-lg font-bold">
                    {title}
                </p>
                <p className="mt-2 text-base text-text-primary font-normal">
                    {description}
                </p>

                {/* BUTTONS */}
                <div className="mt-6 flex justify-end gap-3 text-text-primary">
                    <SecondaryButton onClick={onClose}>{cancelText}</SecondaryButton>

                    {variant === "destructive"
                        ? <DestructiveButton onClick={handleConfirm}>{isLoading ? "Processing..." : confirmText}</DestructiveButton>
                        : <PrimaryButton onClick={handleConfirm}>{isLoading ? "Processing..." : confirmText}</PrimaryButton>
                    }

                </div>
            </div>
        </div>
    )
}