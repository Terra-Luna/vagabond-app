import { useEffect, useState } from 'react'

import { ActiveEffectsComponent, Effect } from './component/ActiveEffectsComponent'

/**
 * This acts like a bridge between the Actor/Item and the react AppV2 window. By having
 * this return the ActiveEffectsComponent, it can catch live updates based on the hooks
 * defined below.
 * @param param0 
 * @returns 
 */
export const ActiveEffectsView = ({ initialDocument }: { initialDocument: Actor | Item }) => {
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

    const handleCreateEffect = async (document: Actor | Item) => {
        await ActiveEffect.create({
            name: "New Effect",
            img: "icons/svg/aura.svg",
            origin: document.uuid,
            disabled: false
        }, { parent: document })
    }

    const handleToggleEffect = async (document: Actor | Item, id: string) => {
        const effect = document.effects.get(id)
        await effect?.update({ disabled: !effect.disabled })
    }

    const handleEditEffect = (document: Actor | Item, id: string) => {
        const effect = document.effects.get(id)
        effect?.sheet?.render({ force: true } as any)
    }

    const handleDeleteEffect = async (document: Actor | Item, id: string) => {
        const effect = document.effects.get(id)
        await effect?.delete()
    }

    const getActiveEffects = (document: Actor | Item): Effect[] => {
        return document.effects.map((effect: any) => {
            const statusId = effect.statuses?.first() || effect.id || ""
            let duration: number = 4
            let sourceName: string = "Environment"

            if (statusId === 'burning') {
                const stackChange = effect.changes.find((c: any) => c.key === "system.statuses.stacks.burning")
                if (stackChange?.value) {
                    try {
                        const parsed = JSON.parse(stackChange.value)
                        duration = parsed.duration || 4

                        // Look up the actor document live using the sourceUuid stored in the schema
                        if (parsed.sourceUuid) {
                            const sourceActor = fromUuidSync(parsed.sourceUuid) as any
                            if (sourceActor) {
                                // If the source is an Item, get its parent Actor name, otherwise get the Actor's name
                                sourceName = sourceActor.actor?.name || sourceActor.name || "Unknown"
                            }
                        }
                    }
                    catch {
                        duration = 4
                    }
                }
            }

            return {
                id: effect.id,
                statusId: statusId,
                name: effect.name,
                img: effect.img,
                disabled: effect.disabled,
                isTransfer: effect.transfer,
                duration: duration,
                sourceName: sourceName
            }
        })
    }

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