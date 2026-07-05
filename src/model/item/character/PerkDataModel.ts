import { lang, vgLiteLang } from "../../../utils/lang"
import { andOrToSymbol, removeLastComma } from "../../../utils/stringUtil"
import { fields, optionalString, requiredString, standardInteger } from "../../common/sharedSchemas"
import ItemDataModel, { BaseItemSchema } from "../ItemDataModel"

const perkSchema = () => {
    return {
        prerequisites: new fields.ArrayField(new fields.SchemaField({ ...prerequisiteSchema() }), { initial: [] })
    }
}

const prerequisiteSchema = () => {
    return {
        type: new fields.StringField({ ...requiredString, choices: Object.keys(lang.VGLITE.PrerequisiteTypes) }),
        stat: new fields.StringField({ ...optionalString, choices: Object.keys(lang.VGLITE.Stat), initial: Object.keys(lang.VGLITE.Stat)[0] }),
        value: new fields.NumberField({ ...standardInteger }),
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

export default class PerkDataModel extends ItemDataModel<PerkSchema> {
    static override defineSchema() {
        return {
            ...super.defineSchema(),
            ...perkSchema()
        }
    }

    override async prepareDerivedData() {
        super.prepareDerivedData()
    }
}

export const perkStatPrerequisitesAsString = (perk: PerkDataModel): string => {
    const statPrereqs = perk.prerequisites.filter(it => it.type === 'stat')
    let stats: string[] = []
    statPrereqs.forEach(s => {
        stats.push(`${vgLiteLang.Stat[s.stat].name}: ${s.value}+`)
    })
    return stats.join(" | ")
}

export const perkTrainingPrerequisitesAsString = (perk: PerkDataModel): string => {
    const trainedPrereqs = perk.prerequisites.filter(it => it.type === 'trained')
    let trainings: string[] = []
    trainedPrereqs.forEach(p => {
        p.skills.forEach(s => {
            const skillNames: string[] = []
            s.skillNames.forEach(n => {
                skillNames.push(vgLiteLang.Skills[n].name)
            })
            trainings.push(removeLastComma(skillNames.join(', '), andOrToSymbol(s.andOr)))
        })
    })
    return trainings.join(' | ')
}

export const perkSpellRerequisitesAsString = (perk: PerkDataModel): string => {
    const spellPrereqs = perk.prerequisites.filter(it => it.type === 'spell').map(p => p.spell)
    return removeLastComma(spellPrereqs.join(", "), ' &')
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