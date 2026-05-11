import { fields, requiredInteger } from "../../foundryHelper"

export const speedSchema = () => {
    return {
        turn: new fields.NumberField({ ...requiredInteger, initial: 25 }),
        turnBonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        crawl: new fields.NumberField({ ...requiredInteger, initial: 75 }),
        travel: new fields.NumberField({ ...requiredInteger, initial: 5 })
    }
}

export type SpeedSchema = ReturnType<typeof speedSchema>

export default class SpeedDataModel extends foundry.abstract.TypeDataModel<SpeedSchema, any> {
    static defineSchema() {
        return speedSchema()
    }

    async calculateSpeeds(dex: number) {
        calculateSpeeds(dex, this)
    }
}

export function calculateSpeeds(dex: number, speed: SpeedDataModel) {
    if (dex < 4) {
        speed.turn = 25 + Number(speed.turnBonus)
        speed.crawl = 25 + Number(speed.turnBonus) * 3
        speed.travel = 5
    }
    else if (dex < 6) {
        speed.turn = 30 + Number(speed.turnBonus)
        speed.crawl = 30 + Number(speed.turnBonus) * 3
        speed.travel = 6
    }
    else {
        speed.turn = 35 + Number(speed.turnBonus)
        speed.crawl = 35 + Number(speed.turnBonus) * 3
        speed.travel = 7
    }
}