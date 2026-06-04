import lang from "../../../../public/lang/en.json"
import { ActiveEffectMode } from "../../../document/VgLiteActiveEffect"
import HeroDataModel from "../../actor/HeroDataModel"
import { sensesSchema } from "../../actor/type/Senses"
import { beingSizeOptions, beingTypeOptions, fields, requiredString } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"
import PerkDataModel from "./PerkDataModel"
import SpellDataModel from "./SpellDataModel"
import { grantSchema, traitSchema } from "./traitsAndFeatures"

const ancestrySchema = () => {
    return {
        senses: new fields.ArrayField(new fields.SchemaField({ ...sensesSchema() }), { initial: [] }),
        beingType: new fields.StringField({ ...beingTypeOptions() }),
        beingSize: new fields.StringField({ ...beingSizeOptions() }),
        traits: new fields.ArrayField(new fields.SchemaField({ ...traitSchema() }), { initial: [] }),
        grants: new fields.ArrayField(new fields.SchemaField({ ...grantSchema() }), { initial: [] }),
        chosenPerks: new fields.ArrayField(new fields.SchemaField({ ...PerkDataModel.defineSchema() })),
        chosenSpells: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() })),
        chosenTrainings: new fields.ArrayField(
            new fields.StringField({
                ...requiredString,
                choices: Object.values(lang.VGLITE.Skills).map(it => it.name)
            })
        )
    }
}

export type AncestrySchema = ReturnType<typeof ancestrySchema> & BaseItemSchema

export default class AncestryDataModel extends ItemDataModel<AncestrySchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...ancestrySchema()
        }
    }
}

export async function applyAncestralTraits(hero: HeroDataModel, ancestry: AncestryDataModel) {
    ancestry?.traits?.forEach(t => {
        t.modifiers?.forEach(m => {
            const effect = {
                name: t.name,
                icon: 'icons/svg/upgrade.svg',
                changes: [
                    {
                        key: `system.bonus.${m.targetStat}`,
                        value: m.value,
                        mode: m.type == 'BONUS' ?
                            ActiveEffectMode.ADD : (
                                m.type == 'SET' ? ActiveEffectMode.OVERRIDE : ActiveEffectMode.CUSTOM
                            )
                    }
                ]
            }
            console.log("Creating active ancestral effect:", effect)
            ancestry.parent.createEmbeddedDocuments('ActiveEffect', [effect])
        })
    })
}