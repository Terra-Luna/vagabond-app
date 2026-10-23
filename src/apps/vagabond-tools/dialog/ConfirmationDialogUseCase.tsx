import { createRoot } from "react-dom/client"

import { getTheme } from "../../../utils/foundryUtils"
import { createStyleTag } from "../../../utils/styleUtils"
import { ConfirmationDialog } from "./ConfirmationDialog"

interface ConfirmDialogOptions {
    title?: string
    description?: string
    confirmText?: string
    onConfirm?: (input?: string) => void
    showInput?: boolean
    inputPlaceholder?: string
    inputDefaultValue?: string
    cancelText?: string
    onCancel?: () => void
    variant?: "destructive" | "primary" | "info"
}

/**
 * Do not use prompt(), some browsers (including Foundry's built-in browser) may throw an error.
 */
export const showInputDialog = async (
    options: Omit<ConfirmDialogOptions, "showInput" | "onConfirm" | "onCancel">
): Promise<string | null> => {
    let value: string | null = null
    await showConfirmationDialog({
        variant: "primary",
        ...options,
        showInput: true,
        onConfirm: (input) => { value = input ?? "" }
    })
    return value
}

export const showConfirmationDialog = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
        const hostElement = document.createElement("div")
        hostElement.style.position = "fixed"
        hostElement.style.inset = "0"
        hostElement.style.zIndex = "100000"
        document.body.appendChild(hostElement)

        const scaduRoot = hostElement.attachShadow({ mode: "open" })
        scaduRoot.appendChild(createStyleTag())

        const reactContainer = document.createElement("div")
        scaduRoot.appendChild(reactContainer)

        const root = createRoot(reactContainer)

        const cleanup = (result: boolean) => {
            root.unmount()
            hostElement.remove()
            resolve(result)
        }

        root.render(
            <div className={`${getTheme()} app-themed-content font-eskapade`}>
                <ConfirmationDialog
                    {...options}
                    isOpen={true}
                    onClose={() => {
                        options.onCancel?.()
                        cleanup(false)
                    }}
                    onConfirm={(input) => {
                        options.onConfirm?.(input)
                        cleanup(true)
                    }}
                />
            </div>
        )
    })
}
