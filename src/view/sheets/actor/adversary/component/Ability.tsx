import { VGLITE as locale } from "../../../../../../public/lang/en.json"
import { PenSquare, Trash } from "lucide-react"
import { useState, useCallback } from "react"
import AdversaryDataModel from "../../../../../model/actor/AdversaryDataModel"
import { updateDocumentAtPath } from "../../../../../utils/documentUtils"
import { tableBorderRounded, subMenuLayout } from "../../../../common/border-styles"
import { useContextMenu } from "../../../../component/ContextMenu"
import { EditableTextField } from "../../../../component/EditableTextField"
import { EnrichedContent } from "../../../../component/EnrichedContent"
import { RichTextField } from "../../../../component/RichTextField"
import { ActionMenuHeader, onClickAction, AddMenuButtons } from "./Action"
import { glowOnHover } from "../../../../common/text-styles"

export const Abilities = ({ adv, setIsAddMenuOpen, setEditTarget }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return (
        <div className="m-2 space-y-1">
            <ActionMenuHeader label={locale.AdversarySheet.abilities} onClick={() => setIsAddMenuOpen(true)} />
            {
                adv.abilities.map(ability => (
                    <div
                        key={ability.name}
                        onContextMenu={(e) => onCtxMenu(e, [
                            { icon: PenSquare, label: 'Edit', action: () => { setEditTarget(ability); setIsAddMenuOpen(true) } },
                            { icon: Trash, label: 'Delete', action: () => deleteAbility(adv, ability), isDestructive: true }
                        ])}
                    >
                        <div className={`${tableBorderRounded} p-2`}>
                            <p className={`font-paradigm font-bold ${glowOnHover} cursor-pointer`} onClick={() => onClickAction(adv, ability.name, ability.description, '', '', '')}>
                                {ability.name}
                            </p>
                            <EnrichedContent content={ability.description} styleClasses="text-xs font-paradigm font-normal" />
                        </div>
                    </div>
                ))
            }
            <ContextMenu />
        </div>
    )
}

export const NewAbilityWindow = ({ adv, setIsAddMenuOpen, editTarget = null, setEditTarget }) => {
    const editTargetIndex = adv.abilities.indexOf(editTarget as any)
    const [newAbility, setNewAbilityInternal] = editTarget == null ? useState<AdversaryAbility>() : useState<AdversaryAbility>(editTarget as AdversaryAbility)
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
                onSave={() => saveNewAbility(adv, newAbility, editTarget, editTargetIndex)}
                setEditTarget={setEditTarget}
                setIsAddMenuOpen={setIsAddMenuOpen}
            />
        </div>
    )
}

export const useAddAbilityMenu = () => {
    const [isAddAbilityOpen, setIsAddAbilityOpen] = useState(false)
    const [editAbilityTarget, setEditAbilityTarget] = useState(null)
    return { isAddAbilityOpen, setIsAddAbilityOpen, editAbilityTarget, setEditAbilityTarget }
}

interface AdversaryAbility {
    name: string, description: string
}

const saveNewAbility = (adv, newAbility, editTarget, editTargetIndex) => {
    if (!newAbility?.name) {
        ui.notifications?.error("Error: [Name] is a required field.")
        return
    }
    else if (editTarget == null) {
        updateDocumentAtPath(adv.parent, ['abilities'], [...adv.abilities, newAbility])
    }
    else {
        const abilities = adv.abilities
        abilities[editTargetIndex] = newAbility
        updateDocumentAtPath(adv.parent, ['abilities'], [...abilities])
    }
}

const deleteAbility = (adv: AdversaryDataModel, ability: any) => {
    updateDocumentAtPath(adv.parent, ['abilities'], adv.abilities.filter(it => it != ability))
}