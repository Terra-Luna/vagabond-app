import { appLang } from "../../../util/lang"
import type { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { damageTypeOptions, fields, optionalString, requiredInteger, requiredString } from "../../common/shared-schemas"
import { BaseItemSchema, ItemDataModel } from "../ItemDataModel"

const spellSchema = () => {
  return {
    baseManaCost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    ignoreEffectCost: new fields.BooleanField({ initial: false }),
    focusExempt: new fields.BooleanField({ initial: false }),
    damageType: new fields.StringField({ ...damageTypeOptions() }),
    upcastableEffect: new fields.BooleanField({ initial: false }),
    upcastableEffectDieRoll: new fields.BooleanField({ initial: false }),
    autoTargetingPref: new fields.StringField({
      ...requiredString,
      initial: "none",
      choices: ["none", "hostile", "friendly"],
    }),
    upkeep: new fields.SchemaField({
      force: new fields.BooleanField({ initial: false }),
      perTarget: new fields.BooleanField({ initial: false }),
    }),
    appliedEffects: new fields.ArrayField(
      new fields.SchemaField({
        effect: new fields.StringField({
          ...requiredString,
          choices: Object.keys(appLang.StatusConditions),
        }),
        duration: new fields.StringField({ ...optionalString }),
        critDuration: new fields.StringField({ ...optionalString }),
      }),
      { initial: [] },
    ),
    appliedActiveEffects: new fields.ArrayField(
      new fields.SchemaField({
        uuid: new fields.StringField({ ...requiredString }),
        duration: new fields.StringField({ ...optionalString }),
      }),
      { initial: [] },
    ),
    // Makes targets emit light when cast for effect.
    emitsLight: new fields.SchemaField({
      enabled: new fields.BooleanField({ initial: false }),
      type: new fields.StringField({
        ...requiredString,
        initial: "basic",
        choices: ["basic", "sunlight", "moonlight"],
      }),
      range: new fields.NumberField({ ...requiredInteger, initial: 30 }),
      duration: new fields.StringField({ ...requiredString, initial: "Cd4" }),
      burns: new fields.ArrayField(
        new fields.StringField({ ...requiredString }),
        {
          initial: [],
        },
      ),
      burnDamage: new fields.StringField({ ...requiredString, initial: "1d6" }),
    }),
  }
}

export type SpellSchema = ReturnType<typeof spellSchema> & BaseItemSchema

export class SpellDataModel extends ItemDataModel<SpellSchema> {

  public _sourceId?: string
  public isRuleSelection?: boolean

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...spellSchema(),
    }
  }

}

export const spellDamageBase = (
  spell: SpellDataModel,
): CardSubHeaderValues[] => {
  return [
    {
      label: appLang.HeroSheet.Magic.labelDmgBase,
      value: appLang.DamageTypes[spell.damageType],
    },
  ]
}
