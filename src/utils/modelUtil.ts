export const getId = (obj: any): string => {
    return obj?.parent?._id ?? ''
}

export const getName = (obj: any): string => {
    return obj?.parent?.name ?? ''
}