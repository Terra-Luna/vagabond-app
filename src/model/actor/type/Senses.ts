import { fields } from "../../common/sharedSchemas"

export const sensesSchema = () => {
    return {
        allsight: new fields.BooleanField({ initial: false }),
        blindsight: new fields.BooleanField({ initial: false }),
        darksight: new fields.BooleanField({ initial: false }),
        echolocation: new fields.BooleanField({ initial: false }),
        seismicsense: new fields.BooleanField({ initial: false }),
        telepathy: new fields.BooleanField({ initial: false })
    }
}

export type SensesSchema = ReturnType<typeof sensesSchema>
export type Senses = foundry.abstract.TypeDataModel<SensesSchema, any>