import type { SpellDeliverySnapshot } from "../../spellcasting/SpellDelivery"
import type { AdversaryAttack, SavingThrowType } from "../AdversaryAttack"
import type { AdversaryComboAttack, ComboSubAttack } from "../AdversaryComboAttack"
import type { AppliedFx,Attack } from "../Attack"
import type { HeroAttack } from "../HeroAttack"
import { SkillCheck } from "../roll/SkillCheck"

export interface ComboSubAttackSnapshot {
    name: string
    saveTypes: SavingThrowType[]
    halfDamageOnSave?: boolean
    isSpellAttack?: boolean
    appliedEffects: { effect: string, duration?: string, critDuration?: string }[]
    damageRoll: any | undefined
    saveResults: Record<string, any>
    defenseArmorBonuses?: Record<string, number>
    rerolledSaveTargetIds: string[]
}

export interface AttackSnapshot {
    type: 'adversary' | 'hero' | 'combo'
    id: string
    itemId: string
    userId: string
    createdAt?: number
    portraitActorId?: string
    actorId: string
    targetIds: string[]
    title: string
    skillCheck: SkillCheck | undefined
    isDefenseCheck: boolean | undefined
    damageRoll: any | undefined
    appliedEffects: { effect: string, duration?: string, critDuration?: string }[]
    spellDelivery: SpellDeliverySnapshot | undefined
    critChoice: "luck" | "damage" | "spellFx" | undefined
    isRerolled: boolean
    imbues?: { actorId: string, spellName: string, spellUuid: string, damageRoll: any, targetIds?: string[], appliedEffects: AppliedFx[] }[]
    isResolved: boolean
    saveTypes: SavingThrowType[] | undefined
    saveResults: Record<string, any> | undefined
    defenseArmorBonuses: Record<string, number> | undefined
    description: string | undefined
    halfDamageOnSave: boolean | undefined
    isSpellAttack?: boolean
    rerolledSaveTargetIds: string[] | undefined
    subAttacks: ComboSubAttackSnapshot[] | undefined
}

export function serializeAttack(atk: Attack): AttackSnapshot | undefined {
    if (atk.attackType === 'adversary') return serializeAdversaryAttack(atk as AdversaryAttack)
    if (atk.attackType === 'combo') return serializeComboAttack(atk as AdversaryComboAttack)
    return serializeHeroAttack(atk as HeroAttack)
}

function cleanDamageRollJson(damageRoll: any) {
    const rawDmg = damageRoll.toJson ? damageRoll.toJson() : damageRoll
    return {
        ...rawDmg,
        result: rawDmg.result ? {
            ...rawDmg.result,
            rolls: rawDmg.result.rolls?.map((r: any) =>
                r && typeof r.toJSON === "function" ? r.toJSON() : r
            ) ?? []
        } : undefined
    }
}

function serializeCommonFields(atk: Attack): Omit<AttackSnapshot, 'skillCheck' | 'itemId' | 'isRerolled' | 'spellDelivery' | 'critChoice'> {
    /**
     * Need to serialize the damage rolls so they can be sent over Foundry's socket.
     */
    const cleanDamageRoll = atk.damageRoll ? cleanDamageRollJson(atk.damageRoll) : undefined

    return {
        id: atk.id,
        type: atk.attackType,
        userId: atk.userId,
        createdAt: atk.createdAt,
        portraitActorId: atk.portraitActorId,
        title: atk.title,
        actorId: atk.actor.id ?? '',
        targetIds: atk.targetIds ?? [],
        damageRoll: cleanDamageRoll,
        appliedEffects: atk.appliedEffects ?? [],
        imbues: atk.imbues.map(imbue => ({ ...imbue, damageRoll: cleanDamageRollJson(imbue.damageRoll) })),
        isResolved: atk.isResolved
    } as any
}

function cleanSkillCheckJson(skillCheck: any) {
    const rawCheck = skillCheck.toJson ? skillCheck.toJson() : skillCheck
    return {
        ...rawCheck,
        result: rawCheck.result ? {
            ...rawCheck.result,
            rolls: rawCheck.result.rolls?.map((r: any) =>
                r && typeof r.toJSON === "function" ? r.toJSON() : r
            ) ?? []
        } : undefined
    }
}

function serializeHeroAttack(atk: HeroAttack): AttackSnapshot {
    /**
     * Need to serialize the skill check rolls so they can be sent over Foundry's socket.
     */
    const cleanSkillCheck = atk.skillCheck ? cleanSkillCheckJson(atk.skillCheck) : undefined

    return {
        ...serializeCommonFields(atk),
        type: 'hero',
        itemId: atk.itemId,
        spellDelivery: atk.spellDelivery,
        skillCheck: cleanSkillCheck,
        isDefenseCheck: atk.isDefenseCheck,
        critChoice: atk.critChoice,
        isRerolled: atk.isRerolled
    } as AttackSnapshot
}

function serializeAdversaryAttack(atk: AdversaryAttack): AttackSnapshot {
    const cleanSaveResults: Record<string, any> = {}
    for (const [targetId, result] of Object.entries(atk.saveResults ?? {})) {
        cleanSaveResults[targetId] = {
            ...result,
            rolls: result.rolls?.map((r: any) =>
                r && typeof r.toJSON === "function" ? r.toJSON() : r
            ) ?? []
        }
    }

    return {
        ...serializeCommonFields(atk),
        type: 'adversary',
        skillCheck: atk.skillCheck ? cleanSkillCheckJson(atk.skillCheck) : undefined,
        saveTypes: atk.saveTypes,
        saveResults: cleanSaveResults,
        defenseArmorBonuses: atk.defenseArmorBonuses,
        description: atk.description,
        halfDamageOnSave: atk.halfDamageOnSave,
        isSpellAttack: atk.isSpellAttack,
        rerolledSaveTargetIds: atk.rerolledSaveTargetIds
    } as AttackSnapshot
}

function serializeComboAttack(atk: AdversaryComboAttack): AttackSnapshot {
    return {
        ...serializeCommonFields(atk),
        type: 'combo',
        subAttacks: atk.subAttacks.map((sub: ComboSubAttack) => sub.toJson())
    } as AttackSnapshot
}
