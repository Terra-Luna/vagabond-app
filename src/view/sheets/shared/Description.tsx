import { useCallback } from "react"
import { updateDocument } from "../../../utils/documentUtils"
import { stripHtml } from "../../../utils/stringUtil"
import { RichTextField } from "../../component/RichTextField"
import ReactHtmlParser from 'react-html-parser'

export const Description = ({ obj, isEditMode }) => {
    const onDescriptionChange = useCallback((descr) => {
        updateDocument(obj, { 'description': descr })
    }, [obj.system])
    return (<>
        {
            stripHtml(obj.system.description).length === 0 && !isEditMode ? <></> :
                <div className="pb-1 border border-dotted border-transparent border-b-table-border">
                    {
                        isEditMode ?
                            <div className="h-[54px] p-0.5">
                                <RichTextField
                                    height={54}
                                    defaultValue={obj.system.description}
                                    onChange={onDescriptionChange}
                                />
                            </div> :
                            <div className="px-2 text-justify font-light italic">
                                {stripHtml(obj.system.description).length > 0 ?
                                    <div className="max-h-[54px] overflow-y-auto">{ReactHtmlParser(obj.system.description)}</div> : <></>
                                }
                            </div>
                    }
                </div>
        }
    </>)
}