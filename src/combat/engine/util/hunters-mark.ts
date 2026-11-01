import { sys_id } from "../../../utils/foundryUtils"
import { getTargetActor } from "../../../utils/modelUtil"

/**
 * These flags are defined by rules on the Hunter's class Features.
 */
export const HUNTERS_MARK_FLAG = "huntersmark"
const LETHAL_PRECISION_FLAG = "lethalprecision"
const APEX_PREDATOR_FLAG = "apexpredator"
const MARK_ICON = "/icons/skills/targeting/crosshair-bars-yellow.webp"

export interface HuntersMarkData {
    hunterId: string
    hunterName: string
}

export interface MarkRequest {
    sceneId: string
    tokenId: string
    hunterId: string
}

export const requestMark = async (request: MarkRequest) => {
    if (game.user?.isGM) {
        await applyMark(request)
    }
    else {
        game.socket?.emit(`system.${sys_id}`, { action: "huntersMark", user: game.user?.id, data: request })
    }
}

export const handleMarkRequest = async (packet: { user?: string, data?: MarkRequest }) => {
    const requester = packet.user ? game.users?.get(packet.user) : undefined
    const hunter = packet.data ? game.actors?.get(packet.data.hunterId) : undefined
    if (!requester || !hunter || !hunter.testUserPermission(requester, "OWNER")) return
    await applyMark(packet.data!)
}

/**
 * Replaces the Hunter's Mark with a new one on the target, or removes it if the target is already Marked
 * by the Hunter via a GM client socket packet.
 */
export const applyMark = async ({ sceneId, tokenId, hunterId }: MarkRequest) => {
    const hunter = game.actors?.get(hunterId)
    const scene = game.scenes?.get(sceneId)
    const targetToken = scene?.tokens.get(tokenId)
    if (!hunter || !targetToken?.actor || !checkHunterFlags(hunterId, HUNTERS_MARK_FLAG)) return

    const alreadyMarked = getMarkEffects(targetToken.actor).some(fx => getMarkData(fx).hunterId === hunterId)

    for (const token of scene!.tokens) {
        const stale = getMarkEffects(token.actor)
            .filter(fx => getMarkData(fx).hunterId === hunterId)
            .map(fx => fx.id as string)
        if (stale.length > 0) await token.actor!.deleteEmbeddedDocuments("ActiveEffect", stale)
    }
    if (alreadyMarked) return

    await targetToken.actor.createEmbeddedDocuments("ActiveEffect", [{
        name: `Marked (${hunter.name})`,
        img: MARK_ICON,
        showIcon: 2,
        flags: { [sys_id]: { [HUNTERS_MARK_FLAG]: { hunterId, hunterName: hunter.name } satisfies HuntersMarkData } },
        changes: [/* Intentionally left blank - the attack engine reads the flag */]
    }] as any)
}

const getMarkEffects = (actor: Actor | undefined | null): ActiveEffect[] =>
    actor ? Array.from(actor.effects as Iterable<ActiveEffect>).filter(fx => fx.flags?.[sys_id]?.[HUNTERS_MARK_FLAG]) : []

const getMarkData = (effect: ActiveEffect): HuntersMarkData => effect.flags?.[sys_id]?.[HUNTERS_MARK_FLAG] as HuntersMarkData

const checkHunterFlags = (hunterId: string, flag: string): boolean =>
    !!game.actors?.get(hunterId)?.getFlag(sys_id, flag as any)

/**
 * The Hunters with the Feature who currently have a 'Marked' effect on the target.
 */
const getActiveMarks = (target: Actor | undefined | null): HuntersMarkData[] =>
    getMarkEffects(target).map(getMarkData).filter(mark => checkHunterFlags(mark.hunterId, HUNTERS_MARK_FLAG))

export const isMarkedBy = (target: Actor | undefined | null, hunterId: string | undefined): boolean =>
    !!hunterId && getActiveMarks(target).some(mark => mark.hunterId === hunterId)

/**
 * Whether the Hunter is attacking any target they've Marked.
 */
export const isAttackingMark = (hunterId: string | undefined, targetTokenIds: string[]): boolean =>
    !!hunterId && targetTokenIds.some(id => isMarkedBy(getTargetActor(id), hunterId))

/**
 * Keen and Vicious are linked (a weapon with either gains both) and the Hunter's checks crit on the sum.
 */
export const applyMarkBenefitsToModifiers = (mods: any) => {
    const linked: string[] = mods.damage.out.global.properties.linked
    for (const prop of ["keen", "vicious"]) {
        if (!linked.includes(prop)) linked.push(prop)
    }
    mods.skillCheck.attack.sumCrit = true
}

/**
 * Apex Predator: the Mark is Weak to the Hunter's own attacks.
 */
export const isWeakToHunter = (target: Actor | undefined | null, hunterId: string | undefined): boolean =>
    isMarkedBy(target, hunterId) && checkHunterFlags(hunterId!, APEX_PREDATOR_FLAG)

/**
 * Lethal Precision: While a Hero has the spotlight, each Mark's Hunter adds extra damage.
 */
export const getLethalPrecisionBonus = (target: Actor | undefined | null): number => {
    const spotlight = (game.combat as any)?.combatant?.token
    if (!spotlight || spotlight.disposition < CONST.TOKEN_DISPOSITIONS.NEUTRAL) return 0

    return getActiveMarks(target).reduce((total, mark) => {
        if (!checkHunterFlags(mark.hunterId, LETHAL_PRECISION_FLAG)) return total
        const level = (game.actors?.get(mark.hunterId)?.system as any)?.level?.current ?? 1
        return total + 1 + Math.floor(Math.max(0, level - 4) / 4)
    }, 0)
}

export const findHunter = (): Actor | undefined => {
    const candidates = [
        ...(canvas?.tokens?.controlled ?? []).map(token => token.actor),
        game.user?.character,
        ...(game.actors?.contents ?? [])
    ]
    return candidates.find((actor): actor is Actor =>
        !!actor && (actor.type as string) === "hero" && actor.isOwner && !!actor.getFlag(sys_id, HUNTERS_MARK_FLAG as any)
    )
}
