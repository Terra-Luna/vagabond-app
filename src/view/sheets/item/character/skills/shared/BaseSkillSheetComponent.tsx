import { Description } from "../../../../shared/Description"
import { ItemSheetBanner } from "../../../shared/ItemSheetBanner"

export const BaseSkillSheetComponent = ({ item, content, description, className }: {
    item: Item & { system: any }, content: React.ReactNode, description?: string, className?: string
}) => {
    return (
        <div className="flex flex-col grow overflow-hidden">
            <ItemSheetBanner item={item} className={className} />
            <div className={`
                    flex-1 
                    -mt-8 pt-8
                    overflow-y-auto 
                    border-3 border-solid border-stat-block-fill/80 
                    border-t-transparent 
                    rounded-b-md
                `}>
                <Description item={item} descriptionOverride={description} showFullView={true} italic={false} hideBorder={true} />
                <div className="flex justify-between mt-2 mx-2 gap-y-4">
                    {content}
                </div>
            </div>
        </div>
    )
}