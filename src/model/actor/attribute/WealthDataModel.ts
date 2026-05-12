import { fields, requiredInteger } from "../../../common/sharedSchemas"

const wealthSchema = () => {
    return {
        g: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        s: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        c: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

export type WealthSchema = ReturnType<typeof wealthSchema>

export default class WealthDataModel extends foundry.abstract.TypeDataModel<WealthSchema, any> {
    static defineSchema() {
        return wealthSchema()
    }

    async consolidate() {
        consolidate(this)
    }
}

export const consolidate = (curr: WealthDataModel) => {
    var copperToSilver = Math.floor(curr.c! / 100)
    curr.s! += copperToSilver
    curr.c! = curr.c! % 100
    var silverToGold = Math.floor(curr.s! / 100)
    curr.g! += silverToGold
    curr.s = curr.s! % 100
}