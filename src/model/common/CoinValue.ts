import { fields, requiredInteger } from "./sharedSchemas"

export const coinSchema = () => {
    return {
        g: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        s: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        c: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

export const consolidate = (coins: any) => {
    var copperToSilver = Math.floor(coins.c! / 100)
    coins.s! += copperToSilver
    coins.c! = coins.c! % 100
    var silverToGold = Math.floor(coins.s! / 100)
    coins.g! += silverToGold
    coins.s = coins.s! % 100
}