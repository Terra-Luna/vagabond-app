import { Effect } from "./ActiveEffectsComponent"

export const handleCreateEffect = async (document: Actor | Item) => {
    await ActiveEffect.create({
        name: "New Effect",
        img: "icons/svg/aura.svg",
        origin: document.uuid,
        disabled: false
    }, { parent: document })
}

export const handleToggleEffect = async (document: Actor | Item, id: string) => {
    const effect = document.effects.get(id)
    await effect?.update({ disabled: !effect.disabled })
}

export const handleEditEffect = (document: Actor | Item, id: string) => {
    const effect = document.effects.get(id)
    effect?.sheet?.render({ force: true } as any)
}

export const handleDeleteEffect = async (document: Actor | Item, id: string) => {
    const effect = document.effects.get(id)
    await effect?.delete()
}

export const getActiveEffects = (document: Actor | Item): Effect[] => {
    return document.effects.map((effect: any) => {
        const statusId = effect.statuses?.first() || effect.id || ""
        let duration: string = "Cd4"
        let sourceName: string = "Environment"

        if (statusId === 'burning') {
            const stackChange = effect.changes.find((c: any) => c.key === "system.statuses.stacks.burning")
            if (stackChange?.value) {
                try {
                    const parsed = JSON.parse(stackChange.value)
                    duration = parsed.duration || "Cd4"

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
                    duration = "Cd4"
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