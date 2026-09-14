import { useCallback, useState } from "react"

import { sys_id } from "../../../../utils/foundryUtils"
import { ConfirmationDialog } from "../../../vagabond-tools/dialog/ConfirmationDialog"
import { RollPreset } from "../../model/RollPreset"

export const useDeletePreset = (actor: Actor) => {

    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, title: "", message: "", onAccept: () => { } })

    const deletePreset = useCallback(async (index: number) => {

        setDeleteConfirmation({
            isOpen: true,
            title: "Delete preset?",
            message: "This will delete the preset and cannot be undone.",
            onAccept: () => {
                const presets = [...actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[] ?? []]
                actor.setFlag(sys_id, "rollPresets", presets.filter((_, pIdx) => pIdx !== index))
            }
        })

    }, [actor])

    const Confirmation = () => {
        return (
            <ConfirmationDialog
                isOpen={deleteConfirmation.isOpen}
                onClose={() => { setDeleteConfirmation(state => ({ ...state, isOpen: false })) }}
                onConfirm={() => deleteConfirmation.onAccept()}
                title={deleteConfirmation.title}
                description={deleteConfirmation.message}
                confirmText="Yes, Delete"
                variant="destructive"
            />
        )
    }

    return { Confirmation, deletePreset }
}