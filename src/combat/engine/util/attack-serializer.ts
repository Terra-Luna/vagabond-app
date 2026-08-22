import type { SpellDeliverySnapshot } from "../../spellcasting/SpellDelivery"
import type { AdversaryAttack } from "../AdversaryAttack"
import type { Attack } from "../Attack"
import type { HeroAttack } from "../HeroAttack"
import { SkillCheck } from "../roll/SkillCheck"

export interface AttackSnapshot {
    type: 'adversary' | 'hero'
    id: string
    itemId: string
    userId: string
    actorId: string
    targetIds: string[]
    title: string
    skillCheck: SkillCheck | undefined
    damageRoll: any | undefined
    spellDelivery: SpellDeliverySnapshot | undefined
    critChoice: "luck" | "damage" | "spellFx" | undefined
    isRerolled: boolean
    isResolved: boolean
}

export function serializeAttack(atk: Attack): AttackSnapshot | undefined {
    if (atk.attackType === 'adversary') return serializeAdversaryAttack(atk as AdversaryAttack)
    return serializeHeroAttack(atk as HeroAttack)
}

function serializeCommonFields(
    atk: Attack
): Omit<AttackSnapshot, 'skillCheck' | 'itemId' | 'isRerolled' | 'spellDelivery' | 'critChoice'> {
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
    }
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
        critChoice: atk.critChoice,
        isRerolled: atk.isRerolled
    } as AttackSnapshot
}

function serializeAdversaryAttack(atk: AdversaryAttack): AttackSnapshot {
    return { ...serializeCommonFields(atk), type: 'adversary' } as AttackSnapshot
}
