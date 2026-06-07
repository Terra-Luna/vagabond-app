








export const getName = (obj: any): string => {
    return obj?.parent?.name ?? ''
}