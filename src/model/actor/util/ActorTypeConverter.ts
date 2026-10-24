import { sys_id } from "../../../utils/foundryUtils"

export type ConvertibleActorType = "hero" | "adversary" | "npc"

export const CONVERTIBLE_ACTOR_TYPES: ConvertibleActorType[] = ["hero", "adversary", "npc"]

export class ActorTypeConverter {

    /**
     * Converts an Actor to another data model type in place (the Actor keeps its id, tokens and embedded Items).
     * System data is carried over wherever the target model has a field of the same name. Foundry discards fields
     * the new type doesn't define, so the full old system data is stashed in a flag (per type) and restored when
     * converting back.
     */
    static async convert(actor: Actor, targetType: ConvertibleActorType): Promise<Actor | undefined> {
        if (!game.user?.isActiveGM) {
            ui.notifications?.warn("Only the active GM can convert Actors.")
            return undefined
        }
        if (!actor || (actor.type as string) === targetType || !CONVERTIBLE_ACTOR_TYPES.includes(targetType)) return actor

        const targetModel = (CONFIG.Actor.dataModels as any)[targetType]
        const targetFields = Object.keys(targetModel?.schema?.fields ?? {})
        if (targetFields.length === 0) {
            ui.notifications?.error(`Unknown Actor type: ${targetType}`)
            return undefined
        }

        const source = foundry.utils.deepClone((actor as any).system.toObject()) as Record<string, any>
        const backups = foundry.utils.deepClone((actor.getFlag(sys_id, "convertedSystems") as Record<string, any> | undefined) ?? {})
        const previousTargetData = backups[targetType] ?? {}

        const system: Record<string, any> = foundry.utils.deepClone(
            Object.fromEntries(targetFields.filter(key => key in previousTargetData).map(key => [key, previousTargetData[key]]))
        )
        for (const key of targetFields) {
            if (key in source) system[key] = source[key]
        }

        ActorTypeConverter.mapAnalagousFields(actor.type as string, targetType, source, system)

        backups[actor.type as string] = source
        delete backups[targetType]

        try {
            await actor.update({
                type: targetType,
                "==system": system,
                [`flags.${sys_id}.convertedSystems`]: backups
            } as any)
            ui.notifications?.info(`${actor.name} converted to ${targetType}.`)
        }
        catch (err) {
            console.error(err)
            ui.notifications?.error(`Failed to convert ${actor.name} to ${targetType}.`)
            return undefined
        }

        await actor.sheet?.render(true)
        return actor
    }

    private static mapAnalagousFields(from: string, to: string, source: Record<string, any>, system: Record<string, any>) {
        const isNpcLike = (type: string) => type === "adversary" || type === "npc"

        if (isNpcLike(from) && to === "hero") {
            if (source.beingSize) system.ancestry = { ...(system.ancestry ?? {}), beingSize: source.beingSize }
            if (source.hitDice) system.level = { ...(system.level ?? {}), current: source.hitDice }
        }
        else if (from === "hero" && isNpcLike(to)) {
            const size = source.ancestry?.beingSize
            if (size) system.beingSize = size
            const level = source.level?.current
            if (level && level > 0) system.hitDice = level
        }
    }

}
