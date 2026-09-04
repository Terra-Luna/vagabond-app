import { PenSquare, Trash } from "lucide-react"
import { useCallback,useState } from "react"

import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { NpcDataModel } from "../../../../../model/actor/NpcDataModel"
import { updateDocumentAtPath } from "../../../../../utils/documentUtils"
import { appLang } from "../../../../../utils/lang"
import { subMenuLayout,tableBorderRounded } from "../../../../common/border-styles"
import { useContextMenu } from "../../../../component/ContextMenu"
import { EditableTextField } from "../../../../component/EditableTextField"
import { EnrichedContent } from "../../../../component/EnrichedContent"
import { RichTextField } from "../../../../component/RichTextField"
import { useEditMode } from "../../../../context/EditModeContext/Hooks"
import { ActionMenuHeader, AddMenuButtons } from "./Actions"
import { onClickAction } from "./hooksAndUtils"

const locale = appLang.NpcSheet

export const Abilities = ({ npc, setIsAddMenuOpen, setEditTarget }) => {
    const { isEditMode } = useEditMode()
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div className="m-2 space-y-1">
            <ActionMenuHeader label={locale.abilities} onClick={() => setIsAddMenuOpen(true)} />
            {
                npc.abilities.map(ability => (
                    <div
                        key={ability.name}
                        onContextMenu={(e) => onCtxMenu(e, [
                            { icon: PenSquare, label: 'Edit', action: () => { setEditTarget(ability); setIsAddMenuOpen(true) } },
                            { icon: Trash, label: 'Delete', action: () => deleteAbility(npc, ability), isDestructive: true }
                        ])}
                    >
                        <div className={`${tableBorderRounded} p-2`}>
                            <p className={`font-paradigm font-bold hover-glow`} onClick={() => onClickAction(npc, ability.name, ability.description, undefined, undefined)}>
                                {ability.name}
                            </p>
                            <EnrichedContent content={ability.description} styleClasses="text-xs font-paradigm font-normal" actor={npc.parent} />
                        </div>
                    </div>
                ))
            }
            {isEditMode && <ContextMenu />}
        </div>
    )
}

export const NewAbilityWindow = ({ npc, setIsAddMenuOpen, editTarget = null, setEditTarget }) => {
    const editTargetIndex = npc.abilities.indexOf(editTarget as any)
    const [newAbility, setNewAbilityInternal] = editTarget == null ? useState<NpcAbility>() : useState<NpcAbility>(editTarget as NpcAbility)
    const setNewAbility = useCallback(async (ability: any) => {
        setNewAbilityInternal(ability)
        return true
    }, [])

    const updateName = useCallback(async (name: string | null) => {
        return setNewAbility({ ...newAbility, name: name })
    }, [setNewAbility, newAbility])

    const updateDescription = useCallback(async (eff: string | null) => {
        return setNewAbility({ ...newAbility, description: eff })
    }, [setNewAbility, newAbility])

    /**
     * VIEW
     */
    return (
        <div className={subMenuLayout}>
            <EditableTextField boundValue={newAbility?.name ?? ''} onSave={updateName} placeholder="New ability..." />
            <RichTextField defaultValue={newAbility?.description} onChange={updateDescription} className="text-xs font-paradigm font-normal" />
            {/* SAVE & CANCEL BUTTONS*/}
            <AddMenuButtons
                onSave={() => saveNewAbility(npc, newAbility, editTarget, editTargetIndex)}
                setEditTarget={setEditTarget}
                setIsAddMenuOpen={setIsAddMenuOpen}
            />
        </div>
    )
}

interface NpcAbility {
    name: string, description: string
}

const saveNewAbility = (npc, newAbility, editTarget, editTargetIndex) => {
    if (!newAbility?.name) {
        ui.notifications?.error("Error: [Name] is a required field.")
        return
    }
    else if (editTarget == null) {
        updateDocumentAtPath(npc.parent, ['abilities'], [...npc.abilities, newAbility])
    }
    else {
        const abilities = npc.abilities
        abilities[editTargetIndex] = newAbility
        updateDocumentAtPath(npc.parent, ['abilities'], [...abilities])
    }
}

const deleteAbility = (npc: AdversaryDataModel | NpcDataModel, ability: any) => {
    updateDocumentAtPath(npc.parent, ['abilities'], npc.abilities.filter(it => it != ability))
}