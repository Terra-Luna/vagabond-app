import { sys_id } from "../../../util/foundry-util"
import { appLang } from "../../../util/lang"
import { localizeString } from "../../../util/locale-util"
import { getTargetActor, isActorInScene } from "../../../util/model-util"

/**
 * These flags are defined by rules on the Hunter's class Features.
 */
export interface HuntersMarkData {
  hunterId: string
  hunterName: string
}

export interface MarkRequest {
  sceneId: string
  tokenId: string
  hunterId: string
}

export class HuntersMark {

  static readonly HUNTERS_MARK_FLAG = "huntersmark"
  private static readonly LETHAL_PRECISION_FLAG = "lethalprecision"
  private static readonly APEX_PREDATOR_FLAG = "apexpredator"
  private static readonly MARK_ICON =
    "/icons/skills/targeting/crosshair-mark-rough-pink.webp"

  /**
   * Entry-point from API - use this to mark a target with the Hunter's Mark.
   */
  static async mark(target?: Token) {
    const marked = target ?? game.user?.targets?.first()
    if (!marked?.document?.parent?.id) {
      ui.notifications?.warn("Target a token to mark.")
      return
    }

    const hunter = HuntersMark.findHunter()
    if (!hunter?.id) {
      ui.notifications?.warn("No Hunter in the current scene.")
      return
    }

    await HuntersMark.requestMark({
      sceneId: marked.document.parent.id,
      tokenId: marked.id,
      hunterId: hunter.id,
    })
  }

  static async requestMark(request: MarkRequest) {
    if (game.user?.isGM) {
      await this.applyMark(request)
    }
    else {
      game.socket?.emit(`system.${sys_id}`, {
        action: "huntersMark",
        user: game.user?.id,
        data: request,
      })
    }
  }

  static async handleMarkRequest(packet: {
    user?: string
    data?: MarkRequest
  }) {
    const requester = packet.user ? game.users?.get(packet.user) : undefined
    const hunter = packet.data
      ? game.actors?.get(packet.data.hunterId)
      : undefined
    if (!requester || !hunter || !hunter.testUserPermission(requester, "OWNER"))
      return
    await this.applyMark(packet.data!)
  }

  /**
   * Replaces the Hunter's Mark with a new one on the target, or removes it if the target is already Marked
   * by the Hunter via a GM client socket packet.
   */
  static async applyMark({ sceneId, tokenId, hunterId }: MarkRequest) {
    const hunter = game.actors?.get(hunterId)
    const scene = game.scenes?.get(sceneId)
    const targetToken = scene?.tokens.get(tokenId)
    if (
      !hunter ||
      !targetToken?.actor ||
      !this.checkHunterFlags(hunterId, this.HUNTERS_MARK_FLAG)
    )
      return
    if (!isActorInScene(hunter, scene)) {
      ui.notifications?.warn(
        localizeString(appLang.Notifications.huntersMarkNotInScene, {
          name: hunter.name ?? "",
        }),
      )
      return
    }

    const alreadyMarked = this.getMarkEffects(targetToken.actor).some(
      (fx) => this.getMarkData(fx).hunterId === hunterId,
    )

    for (const token of scene!.tokens) {
      const stale = this.getMarkEffects(token.actor)
        .filter((fx) => this.getMarkData(fx).hunterId === hunterId)
        .map((fx) => fx.id as string)
      if (stale.length > 0)
        await token.actor!.deleteEmbeddedDocuments("ActiveEffect", stale)
    }
    if (alreadyMarked) return

    await targetToken.actor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: `Marked (${hunter.name})`,
        img: this.MARK_ICON,
        showIcon: 2,
        flags: {
          [sys_id]: {
            [this.HUNTERS_MARK_FLAG]: {
              hunterId,
              hunterName: hunter.name,
            } satisfies HuntersMarkData,
          },
        },
        changes: [
          /* Intentionally left blank - the attack engine reads the flag */
        ],
      },
    ] as any)
  }

  private static getMarkEffects(
    actor: Actor | undefined | null,
  ): ActiveEffect[] {
    return actor
      ? Array.from(actor.effects as Iterable<ActiveEffect>).filter(
          (fx) => fx.flags?.[sys_id]?.[this.HUNTERS_MARK_FLAG],
        )
      : []
  }

  private static getMarkData(effect: ActiveEffect): HuntersMarkData {
    return effect.flags?.[sys_id]?.[this.HUNTERS_MARK_FLAG] as HuntersMarkData
  }

  private static checkHunterFlags(hunterId: string, flag: string): boolean {
    return !!game.actors?.get(hunterId)?.getFlag(sys_id, flag as any)
  }

  /**
   * The Hunters with the Feature who currently have a 'Marked' effect on the target.
   */
  private static getActiveMarks(
    target: Actor | undefined | null,
  ): HuntersMarkData[] {
    return this.getMarkEffects(target)
      .map((effect) => this.getMarkData(effect))
      .filter((mark) =>
        this.checkHunterFlags(mark.hunterId, this.HUNTERS_MARK_FLAG),
      )
  }

  static isMarkedBy(
    target: Actor | undefined | null,
    hunterId: string | undefined,
  ): boolean {
    return (
      !!hunterId &&
      this.getActiveMarks(target).some((mark) => mark.hunterId === hunterId)
    )
  }

  /**
   * Whether the Hunter is attacking any target they've Marked.
   */
  static isAttackingMark(
    hunterId: string | undefined,
    targetTokenIds: string[],
  ): boolean {
    return (
      !!hunterId &&
      targetTokenIds.some((id) => this.isMarkedBy(getTargetActor(id), hunterId))
    )
  }

  /**
   * Keen and Vicious are linked (a weapon with either gains both) and the Hunter's checks crit on the sum.
   */
  static applyMarkBenefitsToModifiers(mods: any) {
    const linked: string[] = mods.damage.out.global.properties.linked
    for (const prop of ["keen", "vicious"]) {
      if (!linked.includes(prop)) linked.push(prop)
    }
    mods.skillCheck.attack.sumCrit = true
  }

  /**
   * Apex Predator: the Mark is Weak to the Hunter's own attacks.
   */
  static isWeakToHunter(
    target: Actor | undefined | null,
    hunterId: string | undefined,
  ): boolean {
    return (
      this.isMarkedBy(target, hunterId) &&
      this.checkHunterFlags(hunterId!, this.APEX_PREDATOR_FLAG)
    )
  }

  /**
   * Lethal Precision: While a Hero has the spotlight, each Mark's Hunter adds extra damage.
   */
  static getLethalPrecisionBonus(target: Actor | undefined | null): number {
    const spotlight = (game.combat as any)?.combatant?.token
    if (!spotlight || spotlight.disposition < CONST.TOKEN_DISPOSITIONS.NEUTRAL)
      return 0

    return this.getActiveMarks(target).reduce((total, mark) => {
      if (!this.checkHunterFlags(mark.hunterId, this.LETHAL_PRECISION_FLAG))
        return total
      const level =
        (game.actors?.get(mark.hunterId)?.system as any)?.level?.current ?? 1
      return total + 1 + Math.floor(Math.max(0, level - 4) / 4)
    }, 0)
  }

  static findHunter(): Actor | undefined {
    const candidates = [
      ...(canvas?.tokens?.controlled ?? []).map((token) => token.actor),
      game.user?.character,
      ...(game.actors?.contents ?? []),
    ]
    return candidates.find(
      (actor): actor is Actor =>
        !!actor &&
        (actor.type as string) === "hero" &&
        actor.isOwner &&
        !!actor.getFlag(sys_id, this.HUNTERS_MARK_FLAG as any) &&
        isActorInScene(actor),
    )
  }

}
