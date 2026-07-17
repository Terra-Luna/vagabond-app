import { useEffect, useState } from 'react'
import { getActiveEffects, handleCreateEffect, handleToggleEffect, handleEditEffect, handleDeleteEffect } from './active-effect-handlers'
import { ActiveEffectsComponent } from './ActiveEffectsComponent'

/**
 * This acts like a bridge between the Actor/Item and the react AppV2 window. By having
 * this return the ActiveEffectsComponent, it can catch live updates based on the hooks
 * defined below.
 * @param param0 
 * @returns 
 */
export const ActiveEffectsManager = ({ initialDocument }: { initialDocument: Actor | Item }) => {
    const [documentState, setDocumentState] = useState(initialDocument)
    const [updateTick, setUpdateTick] = useState(0)

    useEffect(() => {
        const handleDocumentUpdate = (doc: any) => {
            const isTargetDoc = doc.id === initialDocument.id
            const isParentDoc = doc.parent?.id === initialDocument.id

            // Avoid triggering for global hook events.
            if (isTargetDoc || isParentDoc) {
                setDocumentState(initialDocument)
                setUpdateTick(prev => prev + 1)
            }
        }

        // Register hooks
        Hooks.on("updateActiveEffect", handleDocumentUpdate)
        Hooks.on("createActiveEffect", handleDocumentUpdate)
        Hooks.on("deleteActiveEffect", handleDocumentUpdate)

        // Listen to parent updates based on type
        const parentHook = initialDocument instanceof Actor ? "updateActor" : "updateItem"
        Hooks.on(parentHook, handleDocumentUpdate)

        // Clean-up listeners
        return () => {
            Hooks.off("updateActiveEffect", handleDocumentUpdate)
            Hooks.off("createActiveEffect", handleDocumentUpdate)
            Hooks.off("deleteActiveEffect", handleDocumentUpdate)
            Hooks.off(parentHook, handleDocumentUpdate)
        }
    }, [initialDocument])

    return (
        <ActiveEffectsComponent
            key={updateTick}
            effects={getActiveEffects(documentState)}
            onCreate={() => handleCreateEffect(documentState)}
            onToggle={(id: string) => handleToggleEffect(documentState, id)}
            onEdit={(id: string) => handleEditEffect(documentState, id)}
            onDelete={(id: string) => handleDeleteEffect(documentState, id)}
        />
    )
}