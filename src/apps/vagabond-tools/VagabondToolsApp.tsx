import { Cog } from "lucide-react"
import { createRoot } from "react-dom/client"

import { getTheme } from "../../utils/foundryUtils"
import { vgLiteStyles } from "../../utils/styleUtils"
import { PrimaryButton } from "../../view/component/Button"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { VagabondToolsAppView } from "./VagabondToolsAppView"

export class VagabondToolsApp extends VagabondApplication {

    constructor() {
        super({
            window: { title: "Vagabond Tools" },
            position: { width: 400, top: 500, left: 18 },
            Component: VagabondToolsAppView,
        } as VagabondAppArgs)
    }

    static renderCanvasButton() {
        if (!game.user?.isGM) return

        const playersElement = document.getElementById("players")
        if (!playersElement) return

        const parentElement = playersElement.parentElement
        if (!parentElement) return

        let hostElement = parentElement.querySelector("vagabond-ui-root") as HTMLElement
        let root = (hostElement as any)?._reactRoot

        if (!hostElement) {
            hostElement = document.createElement("div")
            hostElement.id = "vagabond-ui-root"
            hostElement.style.display = "flex"
            hostElement.style.pointerEvents = "auto"

            playersElement.before(hostElement)
            const scaduRoot = hostElement.attachShadow({ mode: 'open' })

            const styleTag = document.createElement('style')
            styleTag.textContent = vgLiteStyles
            scaduRoot.appendChild(styleTag)

            const reactContainer = document.createElement('div')
            scaduRoot.appendChild(reactContainer)

            root = createRoot(reactContainer);
            (hostElement as any)._reactRoot = root
        }

        root.render(
            <div className={`${getTheme()} vglite-themed-content flex w-50`}>
                <style>{vgLiteStyles}</style>
                <PrimaryButton onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    new VagabondToolsApp().render({ force: true })
                }} icon={<Cog size={16} />}>
                    Vagabond Tools
                </PrimaryButton>
            </div>
        )
    }

}