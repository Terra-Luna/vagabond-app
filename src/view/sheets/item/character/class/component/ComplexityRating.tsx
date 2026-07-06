import { Star } from "lucide-react"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { ClassSheetLabel } from "./ClassSheetText"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"

export const ComplexityRating = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    return (
        <div className="flex gap-x-1 items-center">
            <ClassSheetLabel text={"Complexity:"} />
            <div className="flex gap-x-0.25">
                {
                    Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={14}
                            className={`
                                text-text-header-tertiary
                                ${index < item.system.complexity ? 'fill-text-header-tertiary' : ''}
                                ${isEditMode ? 'cursor-pointer' : ''}
                            `}
                            onClick={() => {
                                if (isEditMode) {
                                    item.update({ 'system.complexity': index + 1 } as Record<string, number>)
                                }
                            }}
                        />
                    ))
                }
            </div>
        </div>
    )
}