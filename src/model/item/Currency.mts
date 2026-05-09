const currencySchema = () => {
    const f = foundry.data.fields
    return {
        g: new f.NumberField({ required: true, inteiger: true, min: 0, initial: 0 }),
        s: new f.NumberField({ required: true, inteiger: true, min: 0, initial: 0 }),
        c: new f.NumberField({ required: true, inteiger: true, min: 0, initial: 0 })
    }
}

export type CurrencySchema = ReturnType<typeof currencySchema>
export default class Currency extends foundry.abstract.TypeDataModel<CurrencySchema, any> {
    static defineSchema() {
        return currencySchema()
    }

    async consolidateDenominations() {
        var copperToSilver = Math.floor(this.c / 100)
        this.s += copperToSilver
        var silverToGold = Math.floor(this.s / 100)
        this.g += silverToGold
    }
}