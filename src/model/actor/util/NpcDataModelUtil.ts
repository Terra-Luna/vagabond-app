import { getName } from "../../../utils/modelUtil"
import type { AdversaryDataModel } from "../AdversaryDataModel"
import type { NpcDataModel } from "../NpcDataModel"
import { getDamageAverage } from "../type/NpcAction"

export const onNpcPreCreate = (npc, options, data, allowed, actorLink, disposition) => {
    if (allowed === false) return false
    if (options.pack) return

    npc.parent.updateSource({
        'prototypeToken.name': data.name,
        'prototypeToken.actorLink': actorLink,
        'prototypeToken.disposition': disposition,
        'prototypeToken.sight.enabled': true,
        'prototypeToken.sight.range': 500,
        'prototypeToken.occludable.radius': 8
    })
}

export const onUpdateNpc = (npc, changed) => {
    if (!npc.parent.isOwner) return

    if (changed.name) {
        npc.parent.update({ 'prototypeToken.name': changed.name })
    }
    if (changed?.system?.hitDice || changed?.system?.beingSize) {
        npc.parent.update({
            'system.health.current': calcNpcMaxHP(
                changed.system.hitDice ?? npc.hitDice!,
                changed.system.beingSize ?? npc.beingSize
            )
        })
    }
}

export const prepareNpcBaseData = (npc) => {
    npc.parent.prototypeToken.name = getName(npc)
    npc.health.max = calcNpcMaxHP(npc.hitDice ?? 1, npc.beingSize)
    npc.threatLevel = setThreatLevel(npc)
}

export const calcNpcMaxHP = (hitDice: number, size: string): number => {
    return size.toUpperCase() === "SMALL" ? hitDice ?? 1 : Math.floor(hitDice! * 4.5)
}

/**
 * Threat level formula:
 *      a = armor * 2
 *      b = HP / 10
 *      c = Mean dmg-per-round / 6
 *      TL = (a + b) / 4 + c
 */
export const setThreatLevel = (npc: AdversaryDataModel | NpcDataModel): number => {
    const a = npc.armor.rating! * 2
    const b = npc.health.max! / 10
    let c = 0

    if (npc.combo != null && npc.combo.actions != null && npc.combo.actions.length > 0) {
        npc.combo?.actions?.forEach(act => c += (getDamageAverage(act.damage.dice as any) * Number(act.comboCount)))
        npc.actions
            ?.filter(act => npc.combo.actions.findIndex(it => it.name === act.name) < 0)
            .forEach(act => c += getDamageAverage(act.damage.dice as any))
    }
    else {
        npc.actions?.forEach(act => {
            const avg = getDamageAverage(act.damage.dice as any)
            c += isNaN(avg) ? 0 : avg
        })
        c = c / (npc.actions?.length || 1)
    }

    c = c / 6

    return Number(((a + b) / 4 + (c ?? 0)).toFixed(2))
}

/**
 * Foundry's default behaviour when dragging an Actor from the Compendium to the canvas
 * is to import them into the world's DB. This function will intercept subsequent drag/
 * drop events and prevent duplicated world Actor entries from being created in the Actors
 * sidebar.
 * @param data 
 * @param canvas 
 * @returns 
 */
export const enforceSingletonPlaceholder = async (data: Record<string, any>, canvas: Canvas): Promise<void> => {
    const compendiumActor = await fromUuid(data.uuid) as any
    if (!compendiumActor || compendiumActor.type !== "adversary") return

    let worldActor = game.actors?.find(a =>
        (a.type as string) === "adversary" &&
        (a.flags?.core as any)?.sourceId === compendiumActor.uuid
    )

    if (!worldActor) {
        const actorData = game.actors?.fromCompendium(compendiumActor) as Record<string, any>
        if (actorData) {
            actorData.flags = actorData.flags || {}
            actorData.flags.core = actorData.flags.core || {}
            actorData.flags.core.sourceId = compendiumActor.uuid
            worldActor = await Actor.create(actorData as any) as any
        }
    }

    // TODO: maybe figure out how to make this snap-to-grid.
    if (worldActor && canvas.scene) {
        const gridSize = canvas.grid?.size ?? 100
        const x = data.x - (gridSize / 2)
        const y = data.y - (gridSize / 2)

        const tokenDocument = await worldActor.getTokenDocument({ x, y })
        const tokenCreationPayload = tokenDocument.toObject()
        tokenCreationPayload.actorLink = false

        await canvas.scene.createEmbeddedDocuments("Token", [tokenCreationPayload])
    }
}