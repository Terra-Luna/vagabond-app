import lang from "../../../../public/lang/en.json"
import { ActiveEffectMode } from "../../../document/VgLiteActiveEffect"
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
        traitInfo: new fields.ArrayField(new fields.ArrayField(new fields.StringField({ ...requiredString }))),
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


/**
 * Apply Active Effects directly to the ancestry object so they can
 * be removed if a GM needs to swap a Hero's race. This should be
 * called upon saving changes to a Hero's ancestry sheet.
 * @param ancestry 
 */
export async function applyAncestralTraits(ancestry: AncestryDataModel) {
    ancestry?.traits?.forEach(t => {
        t.modifiers?.forEach(m => {
            const effect = {
                name: t.name,
                icon: 'icons/svg/upgrade.svg',
                changes: [
                    {
                        key: `system.stats.${m.targetStat}`,
                        value: m.value,
                        mode: m.type == 'BONUS' ?
                            ActiveEffectMode.ADD : (
                                m.type == 'SET' ? ActiveEffectMode.OVERRIDE : ActiveEffectMode.CUSTOM
                            )
                    }
                ]
            }
            ancestry.parent.createEmbeddedDocuments('ActiveEffect', [effect])
        })
    })
}

export const ancestryFullDescription = (ancestry: AncestryDataModel): string => {
    if (!ancestry) return ''
    let description = ancestry.description
    ancestry.traitInfo.forEach(i => {
        description += "\n"
        description += i[0] + ": " + i[1]
    })
    return description
}