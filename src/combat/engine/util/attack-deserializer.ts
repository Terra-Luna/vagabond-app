import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { AdversaryAttack } from "../AdversaryAttack"
import { HeroAttack } from "../HeroAttack"
import { DamageRoll } from "../roll/DamageRoll"
import { SkillCheck } from "../roll/SkillCheck"
import type { AttackSnapshot } from "./attack-serializer"

export function deserializeAttack(snapshot: AttackSnapshot): AdversaryAttack | HeroAttack | undefined {
    if (snapshot.type === 'adversary') return deserializeAdversaryAttack(snapshot)
    else if (snapshot.type === 'hero') return deserializeHeroAttack(snapshot)
}

function deserializeHeroAttack(snapshot: AttackSnapshot): HeroAttack | undefined {
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

function deserializeAdversaryAttack(snapshot: AttackSnapshot): AdversaryAttack | undefined {
    return undefined
}