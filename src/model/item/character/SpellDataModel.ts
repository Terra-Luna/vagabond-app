import { appLang } from "../../../util/lang"
import type { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { damageTypeOptions, fields, optionalString, requiredInteger, requiredString } from "../../common/shared-schemas"
import { BaseItemSchema, ItemDataModel } from "../ItemDataModel"

const spellSchema = () => {
  return {
    baseManaCost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    ignoreEffectCost: new fields.BooleanField({ initial: false }),
    damageType: new fields.StringField({ ...damageTypeOptions() }),

    // Spells whose effects can linger without needing to be focused.
    focusExempt: new fields.BooleanField({ initial: false }),

    // Allows the caster to spend extra mana to increase their eff. level.
    upcastableEffect: new fields.BooleanField({ initial: false }),

    // Some spells let you spend mana to roll dice for special circumstances (e.g.: Ward's armor mitigation).
    upcastableEffectDieRoll: new fields.BooleanField({ initial: false }),

    // When cast as an Aura, this determines the preferred target disposition.
    autoTargetingPref: new fields.StringField({
      ...requiredString,
      initial: "none",
      choices: ["none", "hostile", "friendly"],
    }),

    // Upkeep mods - some spells demand certain costs per round while focused.
    upkeep: new fields.SchemaField({
      force: new fields.BooleanField({ initial: false }),
      perTarget: new fields.BooleanField({ initial: false }),
    }),

    // Status effects inflicted by the spell (basic).
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

    // Applied Effects inflicted by teh spell (advanced).
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

    // Effects applied to the area of effect that trigger on entering or staying.
    surface: new fields.SchemaField({
      enabled: new fields.BooleanField({ initial: false }),
      onEnter: new fields.SchemaField(surfaceEffect()),
      onStay: new fields.SchemaField(surfaceEffect()),
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

/**
 * What a surface does to a token that enters its area (once a round) or is still in it when a round starts:
 * a damage formula (e.g. "1d6"), rolled for free, and Active Effects.
 */
const surfaceEffect = () => ({
  damage: new fields.StringField({ ...requiredString, initial: "" }),
  activeEffects: new fields.ArrayField(
    new fields.SchemaField({
      uuid: new fields.StringField({ ...requiredString }),
      duration: new fields.StringField({ ...optionalString }),
    }),
    { initial: [] },
  ),
})
