import { useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { ChevronDown, X } from 'lucide-react'
import { Resizable } from 'react-resizable'

const UntypedDraggable = Draggable as any
const UntypedResizable = Resizable as any

/**
 * A popout sheet that will be tethered to the Foundry window which opens it.
 * @param param0
 * @returns 
 */
export const PopoutWindow = ({ title, onClose, children }) => {
    const [dimensions, setDimensions] = useState({ width: 384, height: 500 })
    const [windowOwnerDoc, setWindowOwnerDoc] = useState<Document | null>(null)
    
    const nodeRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (nodeRef.current?.ownerDocument) {
            setWindowOwnerDoc(nodeRef.current.ownerDocument)
        }
    }, [])

    const onResize = (event: any, { size }: { size: { width: number; height: number } }) => {
        setDimensions({ width: size.width, height: size.height });
    }

    const renderResizeHandle = (handleAxis: string, ref: React.RefObject<any>) => (
        <div ref={ref}
            className="absolute bottom-1 right-1 float-right cursor-se-resize text-text-primary"
            style={{ transform: 'rotate(-45deg)' }}
        >
            <ChevronDown size={20} strokeWidth={3} />
        </div>
    )

    return (
        <UntypedDraggable
            nodeRef={nodeRef}
            handle=".window-header"
            cancel=".window-controls"
            ownerDocument={windowOwnerDoc || (typeof document !== 'undefined' ? document : undefined)}
        >
            <UntypedResizable
                width={dimensions.width}
                height={dimensions.height}
                onResize={onResize}
                minConstraints={[280, 350]}
                maxConstraints={[800, 800]}
                draggableOpts={{ enableUserSelectHack: false }}
                handle={renderResizeHandle}
                resizeHandles={['se']}
            >
                <div
                    ref={nodeRef}
                    className={`absolute z-999 flex flex-col text-sm text-text-header-primary overflow-hidden rounded-lg`}
                    style={{
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`
                    }}
                >
                    {/* WINDOW TITLE BAR */}
                    <div className="window-header flex justify-between items-center bg-sheet-header-fill p-2 cursor-move">
                        <span className="font-semibold select-none">{title}</span>

                        {/* CLOSE BUTTON */}
                        <div className="window-controls flex gap-2">
                            <button onClick={onClose} className="p-1"><X size={16} /></button>
                        </div>
                    </div>

                    {/* PROVIDED CONTENT */}
                    <div className="flex-1 overflow-y-auto p-4 bg-sheet-main-fill border-4 border-solid border-sheet-header-fill rounded-B-md">
                        {children}
                    </div>
                </div>
            </UntypedResizable>
        </UntypedDraggable>
    )
}