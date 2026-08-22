import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import type { AdversaryAttack } from "../AdversaryAttack"
import type { HeroAttack } from "../HeroAttack"
import { DamageRoll } from "../roll/DamageRoll"
import { SkillCheck } from "../roll/SkillCheck"
import type { AttackSnapshot } from "./attack-serializer"

export function deserializeAttack(
    snapshot: AttackSnapshot,
    createHeroAttack: (title: string, actor: Actor & { system: HeroDataModel }, targetIds: string[]) => HeroAttack
): AdversaryAttack | HeroAttack | undefined {
    if (snapshot.type === 'adversary') return deserializeAdversaryAttack(snapshot)
    else if (snapshot.type === 'hero') return deserializeHeroAttack(snapshot, createHeroAttack)
}

function deserializeHeroAttack(
    snapshot: AttackSnapshot,
    createHeroAttack: (title: string, actor: Actor & { system: HeroDataModel }, targetIds: string[]) => HeroAttack
): HeroAttack | undefined {
    const actor = game.actors?.get(snapshot.actorId) as Actor & { system: HeroDataModel } | undefined
    if (!actor) return

    const atk = createHeroAttack(snapshot.title, actor, [...snapshot.targetIds])

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

function deserializeAdversaryAttack(snapshot: AttackSnapshot): AdversaryAttack | undefined {
    void snapshot
    return undefined
}