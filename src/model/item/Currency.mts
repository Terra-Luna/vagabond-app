const currencySchema = () => {
    const f = foundry.data.fields
    return {
        g: new f.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        s: new f.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        c: new f.NumberField({ required: true, integer: true, min: 0, initial: 0 })
    }
}

export type CurrencySchema = ReturnType<typeof currencySchema>

export default class Currency extends foundry.abstract.TypeDataModel<CurrencySchema, any> {
    static defineSchema() {
        return currencySchema()
    }

    async consolidateDenominations() {
        consolidateDenominations(this)
    }
}

// exported for unit tests
export const consolidateDenominations = (curr: Currency) => {
    var copperToSilver = Math.floor(curr.c! / 100)
    curr.s! += copperToSilver
    curr.c! = curr.c! % 100
    var silverToGold = Math.floor(curr.s! / 100)
    curr.g! += silverToGold
    curr.s = curr.s! % 100
}