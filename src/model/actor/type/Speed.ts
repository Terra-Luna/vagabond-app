import { fields, requiredInteger } from "../../common/sharedSchemas"

export const speedSchema = () => {
    return {
        turn: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        crawl: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        travel: new fields.NumberField({ ...requiredInteger, initial: 0 })
    }
}