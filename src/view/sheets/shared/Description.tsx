import { useCallback, useRef, useState } from "react"

import { BaseItemSchema, ItemDataModel } from "../../../model/item/ItemDataModel"
import { updateDocument } from "../../../utils/documentUtils"
import { stripHtml } from "../../../utils/stringUtil"
import { EnrichedContent } from "../../component/EnrichedContent"
import { RichTextField } from "../../component/RichTextField"
import { useEditMode } from "../../context/EditModeContext/Hooks"

const MIN_HEIGHT = 32

export const Description = ({ item, descriptionOverride, showFullView = false, italic = true, hideBorder = false, editHeight }: {
    item: Item & { system: ItemDataModel<BaseItemSchema> },
    descriptionOverride?: string,
    showFullView?: boolean,
    italic?: boolean,
    hideBorder?: boolean,
    editHeight?: number
}) => {
    const { isEditMode } = useEditMode()
    const description = descriptionOverride ?? item.system.description
    const [userHeight, setUserHeight] = useState<number | undefined>(undefined)
    const contentRef = useRef<HTMLDivElement>(null)
    const dragStart = useRef<{ y: number, height: number } | null>(null)

    const onDescriptionChange = useCallback((descr) => {
        updateDocument(item, { 'description': descr })
    }, [item.system])

    const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        dragStart.current = { y: e.clientY, height: contentRef.current?.offsetHeight ?? MIN_HEIGHT }
    }

    const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStart.current) return
        setUserHeight(Math.max(MIN_HEIGHT, dragStart.current.height + e.clientY - dragStart.current.y))
    }

    const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        dragStart.current = null
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    return (<>
        {
            stripHtml(description).length === 0 && !isEditMode ? <></> :
                <div className={`relative py-1 pb-2 overflow-hidden text-text-primary bg-sheet-main-fill
                    ${showFullView ? 'h-fit' : ''} 
                    ${hideBorder ? "" : "border border-dotted border-transparent border-b-table-border"}`
                }>
                    {
                        isEditMode ?
                            <div ref={contentRef} className={`${editHeight !== undefined || userHeight !== undefined || showFullView ? 'h-fit' : 'h-[54px]'} p-0.5 overflow-hidden`}>
                                <RichTextField
                                    height={userHeight ?? editHeight ?? (showFullView ? 120 : 54)}
                                    defaultValue={item.system.description}
                                    onChange={onDescriptionChange}
                                />
                            </div> :
                            <div
                                ref={contentRef}
                                className={`${showFullView && userHeight === undefined ? 'h-fit' : ''} px-2 text-sm font-paradigm font-normal leading-5.5 ${italic ? 'italic' : ''} overflow-hidden`}
                                style={userHeight === undefined ? undefined : { height: userHeight }}
                            >
                                {stripHtml(description).length > 0 &&
                                    <div className={`${showFullView ? 'h-fit' : 'max-h-54 overflow-hidden'} ${userHeight === undefined ? '' : 'h-full overflow-y-auto max-h-none'}`}>
                                        <EnrichedContent content={description} actor={item.actor} />
                                    </div>
                                }
                            </div>
                    }
                    {/* RESIZE HANDLE */}
                    <div
                        role="separator"
                        aria-orientation="horizontal"
                        title="Drag to resize"
                        className="absolute -bottom-1 w-full h-2 cursor-row-resize"
                        onPointerDown={onHandlePointerDown}
                        onPointerMove={onHandlePointerMove}
                        onPointerUp={onHandlePointerUp}
                        onPointerCancel={onHandlePointerUp}
                        onDoubleClick={() => setUserHeight(undefined)}
                    >
                        <div className="w-10 h-1 rounded-full bg-table-border mx-auto hover:bg-text-primary/60" />
                    </div>
                </div>
        }
    </>)
}