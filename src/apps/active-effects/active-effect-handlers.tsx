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

export const getActiveEffects = (document: Actor | Item) => {
    return document.effects.map((effect: any) => {
        return {
            id: effect.id,
            name: effect.name,
            img: effect.img,
            disabled: effect.disabled, 
            isTransfer: effect.transfer,
            sourceName: effect.sourceName || "Direct Effect"
        }
    })
}