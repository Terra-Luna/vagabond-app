import { Description } from "../../../../shared/Description"
import { SkillSheetBanner } from "./SkillSheetBanner"

export const BaseSkillSheetComponent = ({ item, content }) => {
    return (
        <div className="flex flex-col grow overflow-hidden">
            <SkillSheetBanner skill={item} />
            <div className={`
                    flex-1 
                    -mt-8 pt-8
                    overflow-y-auto 
                    border-3 border-solid border-stat-block-fill/80 
                    border-t-transparent 
                    rounded-b-md
                `}>
                <Description item={item} showFullView={true} />
                <div className="flex justify-between mt-2 mx-2 gap-y-4">
                    {content}
                </div>
            </div>
        </div>
    )
}