export const groupBy = (key: string, collection: any[]) => {
    return collection.reduce((rv, x) => {
        (rv[x[key]] ??= []).push(x)
        return rv
    }, {})
}