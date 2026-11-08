import { SkillCheck } from "../../../combat/engine/roll/SkillCheck"
import { currentRoundKey } from "../../../combat/spellcasting/focus-round"
import { FocusSpellUtil } from "../../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../../util/lang"
import { sendVagabondChatCard } from "../../../view/chat/ChatCardSerializer"

/**
 * Dropping a stat block on hostile targets is a Polymorph cast, so it owes a Cast check. Casting the spell
 * already makes that check, so a cast that passed it covers the next drop made in the same round.
 */
export class PolymorphCastCheck {

  private static readonly cleared = new Map<string, string>()

  /** Notes that the actor's Polymorph cast has passed its Cast check. */
  static markPassed(actorId: string | null | undefined) {
    if (actorId) PolymorphCastCheck.cleared.set(actorId, currentRoundKey())
  }

  static isRequired(caster: any, tokenIds: (string | undefined)[]): boolean {
    if ((caster?.type as string) !== "hero") return false
    if (!FocusSpellUtil.hasHostileToken(tokenIds.filter(Boolean) as string[]))
      return false
    const covered =
      PolymorphCastCheck.cleared.get(caster.id) === currentRoundKey()
    PolymorphCastCheck.cleared.delete(caster.id)
    return !covered
  }

  /** Rolls and posts the Cast check. Returns whether it succeeded. */
  static async run(caster: any): Promise<boolean> {
    const hero = caster.system
    const skill = hero.class?.castingSkill ?? "arcana"
    const check = new SkillCheck(hero, { type: "cast", skill })
    await check.roll()
    const result = check.result!
    await sendVagabondChatCard(
      caster,
      "SkillCheckChatCard",
      {
        actorId: caster.id ?? "",
        result,
        focusTitle: appLang.Polymorph.castCheck,
      },
      result.rolls,
    )
    const passed = result.outcome !== appLang.RollResult.failure
    return passed
  }

}
