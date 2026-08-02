import { vgLiteLang } from "../../../utils/lang"
import { Attack } from "../Attack"
import { HeroAttack } from "../HeroAttack"
import { AdversaryAttack } from "../AdversaryAttack"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { DamageRoll } from "../DamageRoll"
import { SpellDeliverySnapshot } from "../../spellcasting/SpellDelivery"
import { SkillCheck } from "../SkillCheck"

export interface AttackSnapshot {
    type: 'adversary' | 'hero'
    id: string
    sourceId: string
    userId: string
    actor: string
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
): Omit<AttackSnapshot, 'skillCheck' | 'sourceId' | 'isRerolled' | 'spellDelivery' | 'critChoice'> {
    /**
     * Need to serialize the damage rolls too so they can be sent over Foundry's socket.
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
        actor: atk.actor.id ?? '',
        targetIds: atk.targetIds ?? [],
        damageRoll: cleanDamageRoll,
        isResolved: atk.isResolved
    }
}

function serializeHeroAttack(atk: HeroAttack): AttackSnapshot {
    /**
     * Need to serialize the damage rolls too so they can be sent over Foundry's socket.
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
        sourceId: atk.sourceId,
        spellDelivery: atk.spellDelivery,
        skillCheck: cleanSkillCheck,
        critChoice: atk.critChoice,
        isRerolled: atk.isRerolled
    } as AttackSnapshot
}

export function deserializeHeroAttack(snapshot: AttackSnapshot): HeroAttack | undefined {
    const actor = game.actors?.get(snapshot.actor) as Actor & { system: HeroDataModel } | undefined
    if (!actor) throw new Error("Actor not found")

    const atk = new HeroAttack(snapshot.title, actor, [...snapshot.targetIds])

    atk.id = snapshot.id
    atk.userId = snapshot.userId
    atk.sourceId = snapshot.sourceId
    atk.spellDelivery = snapshot.spellDelivery
    atk.critChoice = snapshot.critChoice
    atk.isRerolled = snapshot.isRerolled
    atk.isResolved = snapshot.isResolved

    const skillCheckClone = snapshot.skillCheck
        ? foundry.utils.deepClone(snapshot.skillCheck)
        : undefined

    atk.skill = skillCheckClone?.skill
    atk.critThreshold = skillCheckClone?.critThreshold ?? 20
    atk.skillCheckModifier = skillCheckClone?.modifier ?? 0
    atk.d20Count = skillCheckClone?.d20Count ?? 1
    atk.isFavored = skillCheckClone?.favorHinder === vgLiteLang.FavorHinder.favor
    atk.isHindered = skillCheckClone?.favorHinder === vgLiteLang.FavorHinder.hinder

    atk.skillCheck = SkillCheck.fromJson(actor, skillCheckClone)

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