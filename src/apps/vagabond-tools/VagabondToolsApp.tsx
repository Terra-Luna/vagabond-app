import { createRoot } from "react-dom/client"
import { vgLiteStyles } from "../../utils/styleUtils"
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication"
import { VagabondToolsAppView } from "./VagabondToolsAppView"
import { PrimaryButton } from "../../view/component/Button"

export class VagabondToolsApp extends VagabondLiteApplication {

    constructor() {
        super({
            window: { title: "Vagabond Tools" },
            position: { width: 400 },
            Component: VagabondToolsAppView,
        } as VagabondLiteAppArgs)
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

        root.render(<>
            <PrimaryButton onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    new VagabondToolsApp().render({ force: true })
                }}>
                Vagabond Tools
            </PrimaryButton>
        </>)
    }

}