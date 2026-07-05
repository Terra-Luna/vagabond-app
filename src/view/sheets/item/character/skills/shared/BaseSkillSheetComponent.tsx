import { Description } from "../../../../shared/Description"
import { SkillSheetBanner } from "./SkillSheetBanner"

export const BaseSkillSheetComponent = ({ item, content }) => {
    return (
        <div className="flex flex-col overflow-hidden">
            <SkillSheetBanner skill={item} />
            <div className="flex-1 overflow-y-auto">
                <Description obj={item} showFullView={true} />
                <div className="flex justify-between mt-2 mx-2 gap-y-4">
                    {content}
                </div>
            </div>
        </div>
    )
}