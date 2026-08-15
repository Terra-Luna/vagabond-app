import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { SpellDeliverySnapshot } from "../../spellcasting/SpellDelivery"
import { AdversaryAttack } from "../AdversaryAttack"
import { Attack } from "../Attack"
import { HeroAttack } from "../HeroAttack"
import { DamageRoll } from "../roll/DamageRoll"
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
    if (atk instanceof HeroAttack) {
        return serializeHeroAttack(atk)
    }
    else if (atk instanceof AdversaryAttack) {
        return serializeAdversaryAttack(atk)
    }
}

export function deserializeAttack(snapshot: AttackSnapshot): AdversaryAttack | HeroAttack | undefined {
    if (snapshot.type === 'adversary') return deserializeAdversaryAttack(snapshot)
    else if (snapshot.type === 'hero') return deserializeHeroAttack(snapshot)
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
        type: atk instanceof HeroAttack ? "hero" : "adversary",
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

export function deserializeHeroAttack(snapshot: AttackSnapshot): HeroAttack | undefined {
    const actor = game.actors?.get(snapshot.actorId) as Actor & { system: HeroDataModel } | undefined
    if (!actor) return

    const atk = new HeroAttack(snapshot.title, actor, [...snapshot.targetIds])

    atk.id = snapshot.id
    atk.userId = snapshot.userId
    atk.itemId = snapshot.itemId
    atk.spellDelivery = snapshot.spellDelivery
    atk.critChoice = snapshot.critChoice
    atk.isRerolled = snapshot.isRerolled
    atk.isResolved = snapshot.isResolved

    atk.skillCheck = SkillCheck.fromJson(
        actor,
        snapshot.skillCheck
            ? foundry.utils.deepClone(snapshot.skillCheck)
            : undefined
    )

    atk.damageRoll = DamageRoll.fromJson(
        snapshot.damageRoll
            ? foundry.utils.deepClone(snapshot.damageRoll)
            : undefined
    )

    return atk
}

function serializeAdversaryAttack(atk: AdversaryAttack): AttackSnapshot {
    return { ...serializeCommonFields(atk), type: 'adversary' } as AttackSnapshot
}

export function deserializeAdversaryAttack(snapshot: AttackSnapshot): AdversaryAttack | undefined {
    return undefined
}