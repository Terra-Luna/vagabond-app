import { Plus, Save, SquarePen, Trash } from "lucide-react"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { SkillCard } from "../../../../../component/SkillCard"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetSectionHeader } from "./ClassSheetText"
import { useCallback, useEffect, useState } from "react"
import { EditableTextField, NumericCounterInput } from "../../../../../component/EditableTextField"
import { RichTextField } from "../../../../../component/RichTextField"
import { DestructiveButton, PrimaryButton } from "../../../../../component/Button"
import { useContextMenu } from "../../../../../component/ContextMenu"
import { vgLiteLang } from "../../../../../../utils/lang"

export const ClassFeaturesConfig = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const [isNewFeatureOpen, setIsNewFeatureOpen] = useState(false)
    const [editFeatureIndex, setEditFeatureIndex] = useState<number | null>(null)
    const onAddNewFeature = useCallback(() => { setIsNewFeatureOpen(true) }, [])
    const sortedFeats = item.system.features.sort((a, b) => (a.level ?? 0) - (b.level ?? 0))

    return (
        <div className="mt-4 space-y-1">
            <div className="flex gap-x-1 items-center">
                <ClassSheetSectionHeader text={vgLiteLang.ClassSheet.labelClassFeat} />
                {isEditMode && <Plus size={24} strokeWidth={3} className="text-text-header-tertiary cursor-pointer hover-glow" onClick={onAddNewFeature} />}
            </div>
            {isNewFeatureOpen && <NewFeatureMenu item={item} setIsNewFeatureOpen={setIsNewFeatureOpen} />}
            {
                sortedFeats.map((feat, index) => (
                    <div key={index} onContextMenu={(e) => {
                        if (!isEditMode) return
                        onCtxMenu(e, [
                            {
                                icon: SquarePen,
                                label: vgLiteLang.ButtonActions.edit,
                                action: () => {
                                    setEditFeatureIndex(index)
                                }
                            },
                            {
                                icon: Trash,
                                label: vgLiteLang.ButtonActions.delete,
                                isDestructive: true,
                                action: async () => {
                                    await item.update({ 'system.features': sortedFeats.filter(f => f !== feat) } as Record<string, any>)
                                    item.render(false)
                                }
                            }
                        ])
                    }}>
                        <ClassFeatureCard item={item} feat={feat} />
                        {editFeatureIndex === index && <NewFeatureMenu item={item} editIndex={editFeatureIndex} setIsNewFeatureOpen={setEditFeatureIndex} />}
                    </div>
                ))
            }
            <ContextMenu />
        </div>
    )
}

const ClassFeatureCard = ({ item, feat }) => {
    return (
        <SkillCard
            title={feat.name}
            subtitles={[{ label: item.name, value: `${vgLiteLang.ClassSheet.labelLevel} ${feat.level}` }]}
            description={feat.description}
        />
    )
}

const NewFeatureMenu = ({ item, editIndex, setIsNewFeatureOpen }: { item: Item & { system: ClassDataModel }, editIndex?: number, setIsNewFeatureOpen: any }) => {
    const [title, setTitle] = useState('')
    const [level, setLevel] = useState(1)
    const [description, setDescription] = useState('')

    const updateTitle = useCallback(async (title: string | null) => {
        setTitle(title ?? '')
        return true
    }, [setTitle, title])

    const updateLevel = useCallback(async (level: string | null) => {
        setLevel(Number(level))
        return true
    }, [setLevel, level])

    const updateDescription = useCallback(async (descr: string | null) => {
        setDescription(descr ?? '')
        return true
    }, [setDescription, description])

    useEffect(() => {
        if (editIndex === undefined) return
        const editTarget = item.system.features[editIndex]
        setTitle(editTarget.name)
        setLevel(editTarget.level as number)
        setDescription(editTarget.description)
    }, [editIndex])

    return (
        <div className="border border-solid border-table-border space-y-1 p-2">
            {/* NAME & LEVEL */}
            <div className="space-y-2">
                <div className="flex gap-x-1 items-end">
                    <ClassSheetLabel text={vgLiteLang.ClassSheet.labelName} />
                    <EditableTextField
                        boundValue={title ?? null}
                        onSave={updateTitle}
                        placeholder={vgLiteLang.ClassSheet.placeholder_featurename}
                    />
                </div>
                <div className="flex gap-x-1 items-end">
                    <ClassSheetLabel text={vgLiteLang.ClassSheet.labelLevel} />
                    <NumericCounterInput
                        value={level}
                        onChange={updateLevel}
                    />
                </div>
            </div>

            {/* FEATURE DESCRIPTION */}
            <ClassSheetLabel text={vgLiteLang.ClassSheet.labelDescr} />
            <RichTextField
                defaultValue={description}
                onChange={updateDescription}
                height={200}
            />

            {/* SAVE & CANCEL BUTTONS */}
            <div className="flex justify-between mt-2">
                <DestructiveButton children={<p>Cancel</p>} onClick={() => { setIsNewFeatureOpen(false) }} />
                <PrimaryButton icon={<Save size={14} />} onClick={async () => {
                    let features = [...item.system.features]
                    if (editIndex !== undefined) {
                        features = features.map((feature, index) => {
                            if (index === editIndex) return { level: level, name: title, description: description }
                            else return feature
                        })
                    }
                    else {
                        features.push({ level: level, name: title, description: description })
                    }

                    await item.update({ 'system.features': features } as Record<string, any>)

                    if (editIndex) setIsNewFeatureOpen(null)
                    else setIsNewFeatureOpen(false)

                }}>
                    {vgLiteLang.ButtonActions.save}
                </PrimaryButton>
            </div>
        </div>
    )
}