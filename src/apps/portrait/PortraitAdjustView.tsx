import { useState } from "react"

import { appLang } from "../../utils/lang"
import { tableBorder } from "../../view/common/border-styles"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { ACTOR_PORTRAIT_HEIGHT, ACTOR_PORTRAIT_WIDTH, calculateAdjImgDims, portraitBoundry, PortraitFrameData, portraitFrameImageStyle, useImageAspect } from "../../view/sheets/actor/component/PortraitFrame"

const previewW = ACTOR_PORTRAIT_WIDTH * 2
const previewH = ACTOR_PORTRAIT_HEIGHT * 2
const minZoom = 1
const maxZoom = 4

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const PortraitAdjustView = ({ img, name, initialFrame, onCancel, onSave }: {
    img: string,
    name: string,
    initialFrame: PortraitFrameData,
    onCancel: () => void,
    onSave: (frame: PortraitFrameData) => Promise<void>
}) => {
    const [frame, setFrame] = useState(initialFrame)
    const { aspect, onLoad } = useImageAspect()

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        let lastX = e.clientX
        let lastY = e.clientY

        const onMove = (move: PointerEvent) => {
            const dx = move.clientX - lastX
            const dy = move.clientY - lastY
            lastX = move.clientX
            lastY = move.clientY

            setFrame(f => portraitBoundry({
                ...f,
                x: f.x - (dx / previewW) * 10000 / calculateAdjImgDims(f.zoom, aspect ?? 1).w,
                y: f.y - (dy / previewH) * 10000 / calculateAdjImgDims(f.zoom, aspect ?? 1).h
            }, aspect ?? 1))
        }

        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
        }

        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }

    const handleWheel = (e: React.WheelEvent) => {
        const zoomDir = e.deltaY < 0 ? 0.1 : -0.1
        setFrame(f => portraitBoundry({ ...f, zoom: clamp(Math.round((f.zoom + zoomDir) * 100) / 100, minZoom, maxZoom) }, aspect ?? 1))
    }

    return (
        <div className="flex flex-col items-center gap-y-2 py-2 font-eskapade text-xl select-none">
            <div
                onPointerDown={handlePointerDown}
                onWheel={handleWheel}
                style={{ width: previewW, height: previewH }}
                className={`relative overflow-hidden bg-black/5 cursor-move touch-none ${tableBorder}`}
            >
                <img
                    src={img} alt={name} draggable={false}
                    onLoad={onLoad}
                    style={portraitFrameImageStyle(frame, aspect)}
                    className="pointer-events-none"
                />
            </div>

            <input
                type="range" min={minZoom} max={maxZoom} step={0.05}
                value={frame.zoom}
                onChange={(e) => setFrame(f => portraitBoundry({ ...f, zoom: Number(e.target.value) }, aspect ?? 1))}
                className="accent-text-header-tertiary"
                style={{ width: previewW }}
            />

            <div className="flex justify-between px-4 w-full">
                <SecondaryButton onClick={onCancel}>{appLang.ButtonActions.cancel}</SecondaryButton>
                <PrimaryButton onClick={async () => await onSave(frame)}>{appLang.ButtonActions.save}</PrimaryButton>
            </div>
        </div>
    )
}