export const getId = (obj: any): string => {
    return obj?.id ?? obj?.parent?.id ?? ''
}

export const getUuid = (obj: any): string => {
    return obj?.uuid ?? obj?.parent?.uuid
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

export const getCanvasToken = (id): Token | undefined => {
    return canvas?.tokens?.get(id)
}