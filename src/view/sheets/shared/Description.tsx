import { useCallback } from "react"

import { BaseItemSchema, ItemDataModel } from "../../../model/item/ItemDataModel"
import { updateDocument } from "../../../utils/documentUtils"
import { stripHtml } from "../../../utils/stringUtil"
import { EnrichedContent } from "../../component/EnrichedContent"
import { RichTextField } from "../../component/RichTextField"
import { useEditMode } from "../../context/EditModeContext/Hooks"

export const Description = ({ item, showFullView = false, italic = true }: {
    item: Item & { system: ItemDataModel<BaseItemSchema> }, showFullView?: boolean, italic?: boolean
}) => {
    const { isEditMode } = useEditMode()
    
    const onDescriptionChange = useCallback((descr) => {
        updateDocument(item, { 'description': descr })
    }, [item.system])
    return (<>
        {
            stripHtml(item.system.description).length === 0 && !isEditMode ? <></> :
                <div className={`${showFullView ? 'h-fit' : ''} py-1 border border-dotted border-transparent border-b-table-border overflow-hidden`}>
                    {
                        isEditMode ?
                            <div className={`${showFullView ? 'h-fit' : 'h-[54px]'} p-0.5 overflow-hidden'}`}>
                                <RichTextField
                                    height={showFullView ? 120 : 54}
                                    defaultValue={item.system.description}
                                    onChange={onDescriptionChange}
                                />
                            </div> :
                            <div className={`${showFullView ? 'h-fit' : ''} px-2 text-justify text-sm font-paradigm font-light ${italic ? 'italic' : ''} overflow-hidden`}>
                                {stripHtml(item.system.description).length > 0 &&
                                    <div className={`${showFullView ? 'h-fit' : 'max-h-54 overflow-hidden'}`}>
                                        <EnrichedContent content={item.system.description} />
                                    </div>
                                }
                            </div>
                    }
                </div>
        }
    </>)
}