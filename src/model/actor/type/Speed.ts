import { fields, requiredInteger } from "../../common/sharedSchemas"

export const speedSchema = () => {
    return {
        turn: new fields.NumberField({ ...requiredInteger, initial: 25 }),
        crawl: new fields.NumberField({ ...requiredInteger, initial: 75 }),
        travel: new fields.NumberField({ ...requiredInteger, initial: 5 })
    }
}