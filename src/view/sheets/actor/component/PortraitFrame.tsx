import { CSSProperties, useState } from "react"

export interface PortraitFrameData { x: number, y: number, zoom: number }

export const defaultPortraitFrame: PortraitFrameData = { x: 50, y: 50, zoom: 1 }

export const portraitFrameFlag = "portraitFrame"

/**
 * Actor portrait dimensions (1.4 ratio).
 */
const frameAspect = 110 / 154


export const calculateAdjImgDims = (zoom: number, imgAspect: number) => {
    const ratio = imgAspect / frameAspect
    return ratio >= 1
        ? { w: zoom * 100, h: (zoom / ratio) * 100 }
        : { w: ratio * zoom * 100, h: zoom * 100 }
}

/**
 * Prevents user from dragging the image out of the re-size frame.
 */
export const portraitBoundry = (frame: PortraitFrameData, imgAspect: number): PortraitFrameData => {
    const zoom = Math.max(1, frame.zoom)
    const { w, h } = calculateAdjImgDims(zoom, imgAspect)
    const clampAxis = (v: number, sizePct: number) => {
        const margin = 5000 / sizePct
        const [min, max] = sizePct >= 100 ? [margin, 100 - margin] : [100 - margin, margin]
        return Math.max(min, Math.min(max, v))
    }
    return { x: clampAxis(frame.x, w), y: clampAxis(frame.y, h), zoom }
}

export const portraitFrameImageStyle = (frame: PortraitFrameData, imgAspect: number | undefined): CSSProperties => {
    if (!imgAspect) return {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        opacity: 0
    }

    const { x, y, zoom } = portraitBoundry(frame, imgAspect)
    const { w, h } = calculateAdjImgDims(zoom, imgAspect)

    /**
     * Using some raw styles here to avoid Tailwind's aversion to doing math.
     */
    return {
        position: 'absolute',
        maxWidth: 'none',
        width: `${w}%`,
        height: `${h}%`,
        left: `${50 - (x * w) / 100}%`,
        top: `${50 - (y * h) / 100}%`
    }
}

export const useImageAspect = () => {
    const [aspect, setAspect] = useState<number>()
    const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget
        if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight)
    }
    return { aspect, onLoad }
}