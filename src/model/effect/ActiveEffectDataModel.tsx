import { fields } from "../common/sharedSchemas";

const activeEffectSchema = () => {
    return {
        requiresEquip: new fields.BooleanField({ initial: true })
    }
}

export type VgLiteActiveEffectSchema = ReturnType<typeof activeEffectSchema>

const BaseActiveEffectModel = (foundry.data as any).ActiveEffectTypeDataModel || foundry.abstract.TypeDataModel

export class ActiveEffectDataModel extends BaseActiveEffectModel<ActiveEffect> {
    declare requiresEquip: boolean

    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...activeEffectSchema()
        }
    }

}