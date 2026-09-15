import { useCallback, useState } from "react"

import { FeatureDataModel } from "../../../../../model/item/character/FeatureDataModel"
import { ItemRulesManager } from "../../../../../rules/ItemRulesManager"
import { appLang } from "../../../../../utils/lang"
import { NumericCounterInput } from "../../../../component/EditableTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel } from "../class/component/ClassSheetText"
import { BaseSkillSheetComponent } from "./shared/BaseSkillSheetComponent"

export const FeatureSheetComponent = ({ item, className }: { item: Item & { system: FeatureDataModel }, className?: string }) => {

    const { isEditMode } = useEditMode()
    const [level, setLevel] = useState(item.system.level ?? 1)
    const [scale, setScale] = useState(item.system.scale ?? 0)
    const [maxLevel, setMaxLevel] = useState(item.system.maxLevel ?? 0)

    const updateLevel = useCallback(async (level: string | null) => {
        setLevel(Number(level) || 1)
        await item.update({ "system.level": Number(level) || 1 } as Record<string, number>)
        return true
    }, [item])
    
    const updateScale = useCallback(async (recurOn: string | null) => {
        setScale(Number(recurOn))
        await item.update({ "system.scale": Number(recurOn) } as Record<string, number>)
        return true
    }, [item])

    const updateMaxLevel = useCallback(async (maxLevel: string | null) => {
        setMaxLevel(Number(maxLevel))
        await item.update({ "system.maxLevel": Number(maxLevel) } as Record<string, number>)
        return true
    }, [item])

    return (
        <BaseSkillSheetComponent item={item} className={className} description={item.system.dynamicDescription()} content={
            <div className="w-full">
                {isEditMode && <div className="flex flex-col gap-2 pb-8">
                    <div className="flex gap-x-2">
                        <div className="flex flex-col items-start">
                            <ClassSheetLabel text={appLang.ClassSheet.labelLevel} />
                            <NumericCounterInput
                                value={level}
                                onChange={updateLevel}
                            />
                        </div>
                        <div className="flex flex-col items-start">
                            <ClassSheetLabel text={appLang.ClassSheet.scale} />
                            <NumericCounterInput
                                value={scale}
                                onChange={updateScale}
                            />
                        </div>
                        <div className="flex flex-col items-start">
                            <ClassSheetLabel text={appLang.ClassSheet.maxLvl} />
                            <NumericCounterInput
                                value={maxLevel}
                                onChange={updateMaxLevel}
                            />
                        </div>
                    </div>

                    {/* FEATURE ITEM RULES */}
                    <ItemRulesManager
                        item={item}
                        name={item.name}
                        level={item.system.level}
                        scale={item.system.scale}
                    />

                </div>}
            </div>
        } />
    )
}