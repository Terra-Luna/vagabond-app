import { fields, requiredInteger } from "./sharedSchemas"
import VgLiteError from "./VgLiteError"

export const coinSchema = () => {
    return {
        g: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        s: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        c: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}

export const coinsAsString = (coins: any) => {
    let coinString = ''
    if (coins.c > 0) {
        coinString = coins.c + "c"
    }
    if (coins.s > 0) {
        if (coinString.length > 0) {
            coinString = coins.s + "s " + coinString
        }
        else {
            coinString = coins.s + "s"
        }
    }
    if (coins.g > 0) {
        if (coinString.length > 0) {
            coinString = coins.g + "g " + coinString
        }
        else {
            coinString = coins.g + "g"
        }
    }
    if (coinString.length == 0) {
        coinString = "-"
    }
    return coinString
}

export const consolidateCoins = (coinsIn: any): { g: number, s: number, c: number } => {
    const coins = coinsIn
    var copperToSilver = Math.floor(coins.c / 100)
    coins.s += copperToSilver
    coins.c = Math.floor(coins.c % 100)
    var silverToGold = Math.floor(coins.s / 100)
    coins.g += silverToGold
    coins.s = Math.floor(coins.s % 100)
    return coins
}

export const addCoins = (coins: any[]) => {
    const total = { g: 0, s: 0, c: 0 }
    coins.forEach(it => total.c += toCopper(it))
    consolidateCoins(total)
    return total
}

export const subtractCoins = (coinsA: any, coinsB: any) => {
    const aTotal = toCopper(coinsA)
    const bTotal = toCopper(coinsB)
    const result = { g: 0, s: 0, c: aTotal - bTotal }
    if (result.c < 0) {
        throw new VgLiteError({ name: NOT_ENOUGH_COINS_ERROR.name, message: NOT_ENOUGH_COINS_ERROR.message })
    }
    consolidateCoins(result)
    return result
}

export const multiplyCoins = (coins: any, multiplier) => {
    let c = toCopper(coins)
    Math.ceil(c *= multiplier)
    const total = { g: 0, s: 0, c: c }
    consolidateCoins(total)
    return total
}

const toCopper = (coins: any): number => {
    return (coins.g * 10000) + (coins.s * 100) + coins.c
}

export const NOT_ENOUGH_COINS_ERROR = { name: 'NOT_ENOUGH_COIN', message: 'Not enough coin' }