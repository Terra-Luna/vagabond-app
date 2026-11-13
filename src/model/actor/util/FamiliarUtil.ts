import { AuraAnchorUtil } from "../../../combat/spellcasting/aoe/AuraAnchorUtil"
import { sys_id } from "../../../util/foundry-util"
import { FAMILIAR_FLAG, FOLLOWER_HERO_FLAG } from "./follower-flags"

export class FamiliarUtil {

  static isFamiliar(actor: Actor | null | undefined): boolean {
    return (
      (actor?.type as string) === "npc" &&
      !!actor?.getFlag(sys_id, FAMILIAR_FLAG as any)
    )
  }

  /** The living Familiar tokens on the current scene that follow this Hero, e.g. as the center of their Aura. */
  static tokensOf(hero: Actor | null | undefined): any[] {
    if (!hero) return []
    const tokens = (canvas?.scene?.tokens?.contents ?? []) as any[]
    return tokens.filter(
      (token) =>
        FamiliarUtil.isFamiliar(token.actor) &&
        token.actor.getFlag(sys_id, FOLLOWER_HERO_FLAG as any) === hero.id &&
        !AuraAnchorUtil.isDown(token),
    )
  }

}
