import { ReactNode } from "react"

export const CanvasOverlayObjectWrapper = ({ objects, onMouseDown, children }: {
    objects: any[],
    onMouseDown: (e, obj) => void,
    children: (obj: any) => ReactNode
}) => {
    return (
        <div className="canvas-overlay-viewport font-eskapade font-bold text-text-primary">
            {objects.map((obj: any) => {
                return (
                    <div
                        key={obj.id}
                        style={{
                            left: `${obj.x * 100}%`,
                            top: `${obj.y * 100}%`,
                            position: 'absolute'
                        }}
                        className="flex flex-col items-center justify-center select-none pointer-events-auto"
                        onMouseDown={(e) => onMouseDown(e, obj)}
                    >
                        {children(obj)}
                    </div>
                )
            })}
        </div>
    )
}