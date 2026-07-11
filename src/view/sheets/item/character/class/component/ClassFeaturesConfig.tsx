import { Plus, Save, Trash } from "lucide-react"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { SkillCard } from "../../../../../component/SkillCard"
import { useEditMode } from "../../../../../context/EditModeContext/Hooks"
import { ClassSheetLabel, ClassSheetSectionHeader } from "./ClassSheetText"
import { useCallback, useEffect, useState } from "react"
import { EditableTextField } from "../../../../../component/EditableTextField"
import { RichTextField } from "../../../../../component/RichTextField"
import { DestructiveButton, PrimaryButton } from "../../../../../component/Button"
import { useContextMenu } from "../../../../../component/ContextMenu"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Grant, GrantModel, Modifier, ModifierModel } from "../../../../../../model/item/character/traitsAndFeatures"

export const ClassFeaturesConfig = ({ item }: { item: Item & { system: ClassDataModel } }) => {
    const { isEditMode } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const [isNewFeatureOpen, setIsNewFeatureOpen] = useState(false)
    const onAddNewFeature = useCallback(() => { setIsNewFeatureOpen(true) }, [])
    const sortedFeats = item.system.features.sort((a, b) => (a.level ?? 0) - (b.level ?? 0))

    return (
        <div className="mt-4 space-y-1">
            <div className="flex gap-x-1 items-center">
                <ClassSheetSectionHeader text={vgLiteLang.ClassSheet.labelClassFeat} />
                {isEditMode ? <Plus size={24} strokeWidth={3} className="text-text-header-tertiary cursor-pointer" onClick={onAddNewFeature} /> : <></>}
            </div>
            {
                isNewFeatureOpen ? <NewFeatureMenu item={item} setIsNewFeatureOpen={setIsNewFeatureOpen} /> : <></>
            }
            {
                sortedFeats.map((feat, index) => (
                    <div key={index} onContextMenu={(e) => {
                        if (!isEditMode) return
                        onCtxMenu(e, [{
                            icon: Trash,
                            label: vgLiteLang.ButtonActions.delete,
                            isDestructive: true,
                            action: async () => {
                                await item.update({ 'system.features': sortedFeats.filter(f => f !== feat) } as Record<string, any>)
                                item.render(false)
                            }
                        }])
                    }}>
                        <ClassFeatureCard item={item} feat={feat} />
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

const NewFeatureMenu = ({ item, setIsNewFeatureOpen }: { item: Item & { system: ClassDataModel }, setIsNewFeatureOpen: any }) => {
    const [title, setTitle] = useState('')
    const [level, setLevel] = useState(1)
    const [description, setDescription] = useState('')
    const [grants, setGrants] = useState<GrantModel[]>([])
    const [modifiers, setModifiers] = useState<ModifierModel[]>([])

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

    const onAddGrant = useCallback(() => {
        setGrants([...grants, { type: '', count: 1, specific: false, trainingOptions: [], selectedPerks: [], spellOptions: [], ignorePrerequisites: false }])
    }, [grants])

    const onAddModifier = useCallback(() => {
        setModifiers([...modifiers, { type: 'BONUS', targetStat: '', value: '0' }])
    }, [modifiers])

    return (
        <div className="border border-solid border-table-border space-y-1 p-2">
            {/* NAME & LEVEL */}
            <div className="flex gap-x-2">
                <div>
                    <ClassSheetLabel text={vgLiteLang.ClassSheet.labelName} />
                    <EditableTextField
                        boundValue={title ?? null}
                        onSave={updateTitle}
                        placeholder={vgLiteLang.ClassSheet.placeholder_featurename}
                    />
                </div>
                <div>
                    <ClassSheetLabel text={vgLiteLang.ClassSheet.labelLevel} />
                    <EditableTextField
                        boundValue={level.toString()}
                        onSave={updateLevel}
                        placeholder={"1"}
                    />
                </div>
            </div>

            {/* FEATURE DESCRIPTION */}
            <ClassSheetLabel text={vgLiteLang.ClassSheet.labelDescr} />
            <RichTextField
                defaultValue={description}
                onChange={updateDescription}
                height={48}
            />

            {/* GRANTS */}
            <div>
                <div className="flex gap-x-1">
                    <ClassSheetLabel text={vgLiteLang.ClassSheet.grants} />
                    <Plus size={20} onClick={onAddGrant} />
                </div>
                <div>
                    {
                        grants.map(grant => (
                            <div>

                            </div>
                        ))
                    }
                </div>
            </div>

            {/* MODIFIERS */}
            <div>
                <div className="flex gap-x-1">
                    <ClassSheetLabel text={vgLiteLang.ClassSheet.modifiers} />
                    <Plus size={20} onClick={onAddModifier} />
                </div>
                <div>
                    {
                        modifiers.map(mod => (
                            <div>

                            </div>
                        ))
                    }
                </div>

            </div>

            {/* SAVE & CANCEL BUTTONS */}
            <div className="flex justify-between mt-2">
                <DestructiveButton children={<p>Cancel</p>} onClick={() => { setIsNewFeatureOpen(false) }} />
                <PrimaryButton icon={<Save size={14} />} onClick={async () => {
                    const features = [
                        ...item.system.features,
                        { level: level, name: title, description: description, modifiers: [], grants: [] }
                    ]
                    await item.update({ 'system.features': features } as Record<string, any>)
                    setIsNewFeatureOpen(false)
                }}>Save</PrimaryButton>
            </div>
        </div>
    )
}