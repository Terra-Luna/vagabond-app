import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { createRoot, Root } from "react-dom/client"

import { getTheme } from "../../utils/foundryUtils"
import { createStyleTag } from "../../utils/styleUtils"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"

export abstract class VagabondCanvasOverlayApp extends VagabondApplication {

    private anchor: string
    private overlayReactRoot: Root | null = null

    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS, {
        window: {
            frame: false,
            minimizable: false,
            resizable: false
        },
        position: {
            width: window.innerWidth,
            height: window.innerHeight,
            top: 0,
            left: 0
        },
        classes: ["canvas-overlay-window"] as string[]
    },
        { inplace: false }
    )

    /**
     * Provide an anchor so it can create the canvas overlay to render the objects on.
     * @param args 
     * @param anchor 
     */
    constructor(args: VagabondAppArgs, anchor: string) {
        super(args)
        this.anchor = anchor
        this.Component = () => {
            const hostRef = useRef<HTMLDivElement>(null)
            const [scaduRoot, setScaduRoot] = useState<ShadowRoot | null>(null)

            useEffect(() => {
                if (hostRef.current && !scaduRoot) {
                    const root = hostRef.current.attachShadow({ mode: 'open' })
                    root.appendChild(createStyleTag())
                    setScaduRoot(root)
                }
            }, [scaduRoot])

            return (
                <div id={this.anchor} ref={hostRef}>
                    {scaduRoot && createPortal(
                        <div className={`${getTheme()} app-themed-content`}>
                            <args.Component />
                        </div>,
                        scaduRoot
                    )}
                </div>
            )
        }

        window.addEventListener("resize", this._handleResize.bind(this))
    }

    private _handleResize() {
        if (!this.element) return
        this.setPosition({
            width: window.innerWidth,
            height: window.innerHeight,
            top: 0,
            left: 0
        })
    }

    override async _renderHTML(): Promise<string> {
        return `<div
            id="${this.anchor}"
            style="width: 100vw height: 100vh position: absolute top: 0 left: 0 pointer-events: none"
        />`
    }

    override _replaceHTML(result: string, content: HTMLElement, options: any) {
        content.innerHTML = result
    }

    override async _onRender(context: any, options: any) {
        await Object.getPrototypeOf(VagabondApplication).prototype._onRender.call(this, context, options)

        if (this.element) {
            this.element.style.setProperty("position", "absolute", "important")
            this.element.style.setProperty("top", "0px", "important")
            this.element.style.setProperty("left", "0px", "important")
            this.element.style.setProperty("width", "100vw", "important")
            this.element.style.setProperty("height", "100vh", "important")
            this.element.style.setProperty("pointer-events", "none", "important")
            this.element.style.setProperty("background", "transparent", "important")
            this.element.style.setProperty("box-shadow", "none", "important")
            this.element.style.setProperty("transform", "none", "important")
        }

        const targetAnchor = this.element.querySelector(`#${this.anchor}`)
        if (!targetAnchor) return

        if (!this.overlayReactRoot) {
            this.overlayReactRoot = createRoot(targetAnchor)
        }

        this.overlayReactRoot.render(React.createElement(this.Component))
    }

    override _updatePosition(position: any) {
        if (!this.element) return position
        this.element.style.setProperty("width", "100vw", "important")
        this.element.style.setProperty("height", "100vh", "important")
        this.element.style.setProperty("transform", "none", "important")
        return position
    }

    protected override _onClose(options: any): void {
        window.removeEventListener("resize", this._handleResize.bind(this))
        if (this.overlayReactRoot) {
            this.overlayReactRoot.unmount()
            this.overlayReactRoot = null
        }
        Object.getPrototypeOf(VagabondApplication).prototype._onClose.call(this, options)
    }

}