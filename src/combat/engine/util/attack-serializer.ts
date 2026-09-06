import type { SpellDeliverySnapshot } from "../../spellcasting/SpellDelivery"
import type { AdversaryAttack, SavingThrowType } from "../AdversaryAttack"
import type { AdversaryComboAttack, ComboSubAttack } from "../AdversaryComboAttack"
import type { Attack } from "../Attack"
import type { HeroAttack } from "../HeroAttack"
import { SkillCheck } from "../roll/SkillCheck"

export interface ComboSubAttackSnapshot {
    name: string
    saveTypes: SavingThrowType[]
    statuses: string[]
    damageRoll: any | undefined
    saveResults: Record<string, any>
    rerolledSaveTargetIds: string[]
}

export interface AttackSnapshot {
    type: 'adversary' | 'hero' | 'combo'
    id: string
    itemId: string
    userId: string
    actorId: string
    targetIds: string[]
    title: string
    skillCheck: SkillCheck | undefined
    isDefenseCheck: boolean | undefined
    damageRoll: any | undefined
    spellDelivery: SpellDeliverySnapshot | undefined
    critChoice: "luck" | "damage" | "spellFx" | undefined
    isRerolled: boolean
    isResolved: boolean
    saveTypes: SavingThrowType[] | undefined
    saveResults: Record<string, any> | undefined
    description: string | undefined
    statuses: string[] | undefined
    rerolledSaveTargetIds: string[] | undefined
    subAttacks: ComboSubAttackSnapshot[] | undefined
}

export function serializeAttack(atk: Attack): AttackSnapshot | undefined {
    if (atk.attackType === 'adversary') return serializeAdversaryAttack(atk as AdversaryAttack)
    if (atk.attackType === 'combo') return serializeComboAttack(atk as AdversaryComboAttack)
    return serializeHeroAttack(atk as HeroAttack)
}

function serializeCommonFields(atk: Attack): Omit<AttackSnapshot, 'skillCheck' | 'itemId' | 'isRerolled' | 'spellDelivery' | 'critChoice'> {
    /**
     * Need to serialize the damage rolls so they can be sent over Foundry's socket.
     */
    let cleanDamageRoll: any = undefined
    if (atk.damageRoll) {
        const rawDmg = atk.damageRoll.toJson ? atk.damageRoll.toJson() : atk.damageRoll

        cleanDamageRoll = {
            ...rawDmg,
            result: rawDmg.result ? {
                ...rawDmg.result,
                rolls: rawDmg.result.rolls?.map((r: any) =>
                    r && typeof r.toJSON === "function" ? r.toJSON() : r
                ) ?? []
            } : undefined
        }
    }

    return {
        id: atk.id,
        type: atk.attackType,
        userId: atk.userId,
        title: atk.title,
        actorId: atk.actor.id ?? '',
        targetIds: atk.targetIds ?? [],
        damageRoll: cleanDamageRoll,
        isResolved: atk.isResolved
    } as any
}

function serializeHeroAttack(atk: HeroAttack): AttackSnapshot {
    /**
     * Need to serialize the skill check rolls so they can be sent over Foundry's socket.
     */
    let cleanSkillCheck: any = undefined
    if (atk.skillCheck) {
        const rawCheck = (atk.skillCheck as any).toJson ? (atk.skillCheck as any).toJson() : atk.skillCheck
        cleanSkillCheck = {
            ...rawCheck,
            result: rawCheck.result ? {
                ...rawCheck.result,
                rolls: rawCheck.result.rolls?.map((r: any) =>
                    r && typeof r.toJSON === "function" ? r.toJSON() : r
                ) ?? []
            } : undefined
        }
    }

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
        saveTypes: atk.saveTypes,
        saveResults: cleanSaveResults,
        description: atk.description,
        statuses: atk.statuses,
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
