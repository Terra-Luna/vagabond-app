import { ActiveEffectMode } from "../../../document/VgLiteActiveEffect"
import { updateDocument } from "../../../utils/documentUtils"
import { lang, vgLiteLang } from "../../../utils/lang"
import { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { beingSizeOptions, beingTypeOptions, fields, requiredString } from "../../common/sharedSchemas"
import { ItemDataModel, BaseItemSchema } from "../ItemDataModel"
import { traitSchema } from "./traitsAndFeatures"

const ancestrySchema = () => {
    return {
        senses: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Senses) }), { initial: [] }),
        beingType: new fields.StringField({ ...beingTypeOptions() }),
        beingSize: new fields.StringField({ ...beingSizeOptions() }),
        traits: new fields.ArrayField(new fields.SchemaField({ ...traitSchema() }), { initial: [] }),
        chosenPerks: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
        chosenSpells: new fields.ArrayField(new fields.StringField({ ...requiredString }), { initial: [] }),
        chosenTrainings: new fields.ArrayField(new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Skills) }), { initial: [] })
    }
}

export type AncestrySchema = ReturnType<typeof ancestrySchema> & BaseItemSchema

export class AncestryDataModel extends ItemDataModel<AncestrySchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...ancestrySchema()
        }
    }

    updateTraitValue(traitField: string, traitValue: any, traitIndex: number) {
        const traits = foundry.utils.deepClone(this.traits)
        traits[traitIndex][`${traitField}`] = traitValue
        return updateDocument(this.parent, { traits })
    }

    updateModifierValue(modifierField: string, modifierValue: any, traitIndex: number, modifierIndex) {
        const modifiers = foundry.utils.deepClone(this.traits[traitIndex].modifiers)
        modifiers[modifierIndex][`${modifierField}`] = modifierValue
        return this.updateTraitValue("modifiers", modifiers, traitIndex)
    }

    removeModifier(modifier: any, traitIndex: number) {
        const idx = this.traits[traitIndex].modifiers.indexOf(modifier)

        const modifiers = foundry.utils.deepClone(this.traits[traitIndex].modifiers)
        if (idx !== -1) {
            modifiers.splice(idx, 1)
            this.updateTraitValue("modifiers", modifiers, traitIndex)
        }
    }

    updateGrantValue(grantField: string, grantValue: any, traitIndex: number, grantIndex) {
        const grants = foundry.utils.deepClone(this.traits[traitIndex].grants)
        grants[grantIndex][`${grantField}`] = grantValue
        return this.updateTraitValue("grants", grants, traitIndex)
    }

    removeGrant(grant: any, traitIndex: number) {
        const idx = this.traits[traitIndex].grants.indexOf(grant)

        const grants = foundry.utils.deepClone(this.traits[traitIndex].grants)
        if (idx !== -1) {
            grants.splice(idx, 1)
            this.updateTraitValue("grants", grants, traitIndex)
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
    ancestry.traits.forEach(i => {
        description += "\n"
        description += i[0] + ": " + i[1]
    })
    return description
}

export const ancestrySizeAndType = (ancestry: AncestryDataModel): CardSubHeaderValues[] => {
    return [
        { label: vgLiteLang.HeroCreation.beingSize, value: vgLiteLang.Sizes[ancestry.beingSize ?? 'medium'] },
        { label: vgLiteLang.HeroCreation.beingType, value: vgLiteLang.BeingTypes[ancestry.beingType] }
    ]
}

export function getAncestryStatBonuses(ancestry: AncestryDataModel | undefined): { name: string, bonus: number }[] {
    if (!ancestry) return []
    return ancestry.traits.filter(t =>
        t.modifiers.some(m => m.type === 'BONUS' && m.targetStat === 'statBonusPoints' && Number(m.value) > 0)
    ).map(t => {
        return t.modifiers.map(m => ({ name: t.name, bonus: Number(m.value) }))
    }).deepFlatten()
}

export function getAncestryGrantedTrainings(ancestry: AncestryDataModel | undefined): { name: string, count: number, choices: string[] }[] {
    if (!ancestry) return []
    return ancestry.traits.filter(t =>
        t.grants.some(g => g.type === 'TRAINING')
    ).map(t => {
        return t.grants.map(g => ({ name: t.name, count: g.count, choices: g.trainingOptions }))
    }).deepFlatten()
}