import { fields, requiredInteger } from "../../foundryHelper"

export const speedSchema = () => {
    return {
        turn: new fields.NumberField({ ...requiredInteger, initial: 25 }),
        crawl: new fields.NumberField({ ...requiredInteger, initial: 75 }),
        travel: new fields.NumberField({ ...requiredInteger, initial: 5 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 })
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
    const bonus = Number(speed.bonus || 0)
    if (dex < 4) {
        speed.turn = 25 + bonus
        speed.crawl = (25 + bonus) * 3
        speed.travel = 5
    }
    else if (dex < 6) {
        speed.turn = 30 + bonus
        speed.crawl = (30 + bonus) * 3
        speed.travel = 6
    }
    else {
        speed.turn = 35 + bonus
        speed.crawl = (35 + bonus) * 3
        speed.travel = 7
    }
}