import { lang, vgLiteLang } from "../../../utils/lang"
import { andOrToSymbol, removeLastComma } from "../../../utils/stringUtil"
import { CardSubHeaderValues } from "../../../view/component/SkillCard"
import { statsSchema } from "../../actor/type/Stats"
import { fields, optionalString, requiredString, standardInteger } from "../../common/sharedSchemas"
import {BaseItemSchema,ItemDataModel } from "../ItemDataModel"

const perkSchema = () => {
    return {
        prerequisites: new fields.ArrayField(new fields.SchemaField({ ...prerequisiteSchema() }), { initial: [] }),
        canTakeMultiple: new fields.BooleanField({ initial: false })
    }
}

const prerequisiteSchema = () => {
    return {
        type: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.PrerequisiteTypes) }),
        stat: new fields.StringField({ ...optionalString, choices: Object.keys(lang.VGLITE.Stat), initial: Object.keys(lang.VGLITE.Stat)[0] }),
        value: new fields.NumberField({ ...standardInteger, initial: 3 }),
        spell: new fields.StringField({ ...optionalString, initial: 'Any' }),
        skills: new fields.ArrayField(
            new fields.SchemaField({
                skillNames: new fields.ArrayField(
                    new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.Skills) }),
                    { initial: [Object.keys(lang.VGLITE.Skills)[0]] }
                ),
                andOr: new fields.StringField({ ...optionalString, choices: ['and', 'or'], initial: null })
            }), { initial: [{ skillNames: [Object.keys(lang.VGLITE.Skills)[0]] }] }
        )
    }
}

export type PerkSchema = ReturnType<typeof perkSchema> & BaseItemSchema

export class PerkDataModel extends ItemDataModel<PerkSchema> {
    public _sourceId?: string
    public isRuleSelection?: boolean

    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...perkSchema()
        }
    }
}

export function addPerkPrerequisite(perk: Item & { system: PerkDataModel }) {
    perk.update(
        {
            'system.prerequisites': [
                ...perk.system.prerequisites,
                { type: Object.keys(lang.VGLITE.PrerequisiteTypes)[0] }
            ]
        } as Record<string, any[]>)
}

export function deletePerkPrerequisite(perk: Item & { system: PerkDataModel }, deleteIndex: number) {
    perk.update({
        'system.prerequisites': [
            ...perk.system.prerequisites.filter((_, index) => index !== deleteIndex)
        ]
    } as Record<string, any>)
}

export const perkPrerequisites = (perk: PerkDataModel): CardSubHeaderValues[] => {
    if (perk.prerequisites.length === 0) return [{ label: "Req", value: "None" }]
    const values: CardSubHeaderValues[] = []
    const spellReqs = perkSpellRerequisitesAsString(perk)
    const statReqs = perkStatPrerequisitesAsString(perk)
    const trainedReqs = perkTrainingPrerequisitesAsString(perk)
    if (spellReqs !== '') values.push({ label: 'Spell', value: spellReqs })
    if (statReqs !== '') values.push({ label: 'Stat', value: statReqs })
    if (trainedReqs !== '') values.push({ label: 'Trained', value: trainedReqs })
    return values
}

export const perkSpellRerequisitesAsString = (perk: PerkDataModel): string => {
    const spellPrereqs = perk.prerequisites?.filter(it => it.type === 'spell')?.map(p => p.spell)
    return removeLastComma(spellPrereqs?.join(", "), ' &')
}

export const perkStatPrerequisitesAsString = (perk: PerkDataModel): string => {
    const statPrereqs = perk.prerequisites?.filter(it => it.type === 'stat')
    const stats: string[] = []
    statPrereqs?.forEach(s => {
        stats.push(`${vgLiteLang.Stat[s.stat].abbr} ${s.value}+`)
    })
    return stats?.join(" | ") ?? ''
}

export const perkTrainingPrerequisitesAsString = (perk: PerkDataModel): string => {
    const trainedPrereqs = perk.prerequisites?.filter(it => it.type === 'trained')
    const trainings: string[] = []
    trainedPrereqs?.forEach(p => {
        p.skills.forEach(s => {
            if (s.skillNames.length === 1) {
                trainings.push(vgLiteLang.Skills[s.skillNames[0]].name)
            }
            else {
                const skillNames: string[] = []
                s.skillNames.forEach(n => {
                    skillNames.push(vgLiteLang.Skills[n].name)
                })
                trainings.push(removeLastComma(skillNames.join(', '), andOrToSymbol(s.andOr)))
            }
        })
    })
    return trainings.join(' & ') ?? ''
}

/**
 * Assesses the given perk against the given criteria to check 
 * whether the prerequisite requirements are met.
 * @param stats 
 * @param trainings 
 * @param spells 
 * @param perk 
 * @returns 
 */
export const isEligibleForPerk = (stats: ReturnType<typeof statsSchema>, trainings: string[], spells: string[], perk: PerkDataModel): boolean => {
    let isEligible = true

    for (const pre of perk.prerequisites) {
        if (!isEligible) continue

        if (pre.type === 'stat') {
            isEligible = stats[pre.stat] >= (pre.value ?? 2)
        }
        else if (pre.type === 'trained') {
            for (const skill of pre.skills) {
                if (!isEligible) continue

                if (skill.skillNames.length === 1) {
                    isEligible = trainings.includes(pre.skills[0].skillNames[0])
                }
                else if (skill.andOr === 'and') {
                    isEligible = skill.skillNames.every(sk => trainings.includes(sk))
                }
                else if (skill.andOr === 'or') {
                    isEligible = skill.skillNames.some(sk => trainings.includes(sk))
                }
            }
        }
        else if (pre.type === 'spell') {
            isEligible = (pre.spell.toUpperCase() === 'ANY' && spells.length > 0) || spells.includes(pre.spell)
        }
    }

    return isEligible
}

/**
 * Returns true if the given perk has a prerequisite matching any of the given trainings.
 * @param trainings
 * @param perk 
 * @returns 
 */
export const isTrainingPrereqMatch = (trainings: string[], perk: PerkDataModel): boolean => {
    let isMatch = false
    const trainingPrereqs = perk.prerequisites.filter(pre => pre.type === 'training')

    for (const training of trainings) {
        if (isMatch) continue
        isMatch = trainingPrereqs.some(pr => pr.skills.flatMap(sk => sk.skillNames).includes(training))
    }

    return isMatch
}