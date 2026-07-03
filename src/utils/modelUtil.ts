export const getId = (obj: any): string => {
    return obj?._id ?? obj?.parent?._id ?? ''
}

export const getName = (obj: any): string => {
    return obj?.name ?? obj?.parent?.name ?? ''
}

export const getPortrait = (obj: any): string => {
    return obj?.img ?? obj?.parent?.img
}

export const getTokenImg = (obj: any): string => {
    return (obj?.document?.texture?.src ?? obj?.prototypeToken?.texture?.src) ?? null
}

export const getTargets = (): string[] => {
    const tokenIds = Array.from(game.user?.targets ?? []).map(t => t.id)
    return tokenIds
}

export const getCanvasToken = (id) => {
    return canvas?.tokens?.get(id)
}