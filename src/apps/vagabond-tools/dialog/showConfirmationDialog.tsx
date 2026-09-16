import { createRoot } from "react-dom/client"

import { getTheme } from "../../../utils/foundryUtils"
import { createStyleTag } from "../../../utils/styleUtils"
import { ConfirmationDialog } from "./ConfirmationDialog"

interface ConfirmDialogOptions {
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "primary"
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
                    onClose={() => cleanup(false)}
                    onConfirm={() => cleanup(true)}
                />
            </div>
        )
    })
}
