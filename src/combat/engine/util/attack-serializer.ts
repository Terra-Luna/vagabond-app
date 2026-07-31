import { vgLiteLang } from "../../../utils/lang"
import { Attack } from "../Attack"
import { HeroAttack } from "../HeroAttack"
import { AdversaryAttack } from "../AdversaryAttack"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { SkillCheckResult } from "../SkillCheck"
import { DamageRoll, DamageRollResult } from "../DamageRoll"
import { SpellDeliverySnapshot } from "../../spellcasting/SpellDelivery"

export interface AttackSnapshot {
    type: 'adversary' | 'hero'
    id: string
    sourceId: string
    userId: string
    actor: string
    targetIds: string[]
    title: string
    damageRoll: any | undefined
    damageRollResult: DamageRollResult | undefined
    skillCheckResult: SkillCheckResult | undefined
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

function serializeHeroAttack(atk: HeroAttack): AttackSnapshot {
    return {
        ...serializeCommonFields(atk),
        type: 'hero',
        sourceId: atk.sourceId,
        spellDelivery: atk.spellDelivery,
        skillCheckResult: atk.skillCheckResult,
        critChoice: atk.critChoice,
        isRerolled: atk.isRerolled
    } as AttackSnapshot
}

export function deserializeHeroAttack(snapshot: AttackSnapshot): HeroAttack | undefined {
    const actor = game.actors?.get(snapshot.actor) as Actor & { system: HeroDataModel } | undefined
    if (!actor) throw new Error("Actor not found")

    const skillCheckClone = snapshot.skillCheckResult
        ? foundry.utils.deepClone(snapshot.skillCheckResult)
        : undefined
    const damageRollClone = snapshot.damageRoll
        ? foundry.utils.deepClone(snapshot.damageRoll)
        : undefined
    const damageRollResultClone = snapshot.damageRollResult
        ? foundry.utils.deepClone(snapshot.damageRollResult)
        : undefined

    const atk = new HeroAttack(snapshot.title, actor, [...snapshot.targetIds])

    atk.id = snapshot.id
    atk.userId = snapshot.userId
    atk.sourceId = snapshot.sourceId
    atk.spellDelivery = snapshot.spellDelivery
    atk.critChoice = snapshot.critChoice
    atk.isRerolled = snapshot.isRerolled
    atk.isResolved = snapshot.isResolved
    atk.skill = skillCheckClone?.skill
    atk.critThreshold = skillCheckClone?.critThreshold ?? 20
    atk.skillCheckModifier = skillCheckClone?.modifier ?? 0
    atk.d20Count = skillCheckClone?.d20Count ?? 1
    atk.isFavored = skillCheckClone?.favorHinder === vgLiteLang.FavorHinder.favor
    atk.isHindered = skillCheckClone?.favorHinder === vgLiteLang.FavorHinder.hinder
    atk.skillCheckResult = skillCheckClone
    atk.damageRoll = DamageRoll.fromJson(damageRollClone)
    atk.damageRollResult = damageRollResultClone

    return atk
}

function serializeAdversaryAttack(atk: AdversaryAttack): AttackSnapshot {
    return { ...serializeCommonFields(atk), type: 'adversary' } as AttackSnapshot
}

export function deserializeAdversaryAttack(snapshot: AttackSnapshot): AdversaryAttack | undefined {
    return undefined
}

function serializeCommonFields(
    atk: Attack
): Omit<AttackSnapshot, 'type' | 'skillCheckResult' | 'sourceId' | 'isRerolled' | 'spellDelivery' | 'critChoice'> {
    return {
        id: atk.id,
        userId: atk.userId,
        title: atk.title,
        actor: atk.actor.id ?? '',
        targetIds: atk.targetIds ?? [],
        damageRoll: atk.damageRoll?.toJson(),
        damageRollResult: atk.damageRollResult,
        isResolved: atk.isResolved
    }
}