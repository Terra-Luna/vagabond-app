export const getId = (obj: any): string => {
    return obj?.id ?? obj?.parent?.id ?? ''
}

export const getUuid = (obj: any): string => {
    return obj?.uuid ?? obj?.parent?.uuid
}

export const getName = (obj: any): string => {
    return obj?.name ?? obj?.parent?.name ?? ''
}

export const getPortrait = (obj: any): string => {
    return obj?.img ?? obj?.parent?.img
}

export const getTokenImg = (obj: any): string => {
    return (obj?.document?.texture?.src ?? obj?.prototypeToken?.texture?.src) ?? obj?.img
}

export const getTargets = (): Token[] => {
    const tokens = Array.from(game.user?.targets ?? [])
    return tokens
}

export const getTargetIds = (): string[] => getTargets().map(t => t.id)

export const getCanvasToken = (id): Token | undefined => {
    if (!id) return undefined
    return canvas?.tokens?.get(id)
}

export const isPathOfType = (obj: any, path: string, expectedType: "string" | "number" | "boolean" | "object"): boolean => {
    const value = foundry.utils.getProperty(obj, path)
    return typeof value === expectedType
}

/**
 * This is a helper interface/function for merging all game items
 * with compendium items. Packs are stored "cold" (not in memory),
 * therefore it's necessary for this to be async so that fetch can
 * be awaited.
 */
export interface TypedIndexEntry {
    _id: string
    name: string
    type: string
    img: string
    uuid: string
    [key: string]: unknown
}

export const COMPENDIUM_INDEX_FIELDS = [
    "type",
    "img",
    "system.rules",
    "system.prerequisites",
    "system.value",
    "system.totalValue",
    "system.category",
    "system.isMaterials",
    "system.isAlchemyTools",
    "system.canTakeMultiple",
    "system.startingPacks",
    "system.damage",
    "system.bulk",
    "system.alchemyCategory",
    "system.description",
    "system.rating",
    "system.mightReq",
    "system.cost",
    "system.items",
    "system.skills",
    "system.grip",
    "system.properties"
]

/**
 * A utility function which queries all world and compendium items of the given types in a single pass.
 * Best used in conjunction with inventoryItemTypes()
 * @param itemTypes 
 * @returns 
 */
export const CombinedItemsMultiType = async (itemTypes: string[]): Promise<Array<Item | TypedIndexEntry>> => {
    const typeSet = new Set(itemTypes)
    const worldItems = Array.from(game.items?.values() ?? []).filter(item => typeSet.has(item?.type)) as Item[]
    const worldNames = new Set(worldItems.map(item => item.name?.trim().toLowerCase()))

    const packs = game.packs?.filter((pack) => pack.metadata.type === "Item") ?? []
    await Promise.all(packs.map(pack => pack.getIndex({ fields: COMPENDIUM_INDEX_FIELDS } as unknown as Parameters<typeof pack.getIndex>[0])))

    const compendiumItems: TypedIndexEntry[] = []
    for (const pack of packs) {
        const entries = (pack.index?.contents ?? []) as unknown as TypedIndexEntry[]
        for (const entry of entries) {
            if (!typeSet.has(entry?.type)) continue
            const entryName = entry.name?.trim().toLowerCase()
            if (!worldNames.has(entryName)) {
                compendiumItems.push(entry)
            }
        }
    }

    return [...worldItems, ...compendiumItems]
}

export const CombinedItemsAll = async (): Promise<Array<Item | TypedIndexEntry>> => {
    const types = ['ancestry', 'class', 'perk', 'spell', ...inventoryItemTypes()]
    return CombinedItemsMultiType(types)
}

/**
 * A utility function which queries all world and compendium items of the given type and returns a combined list.
 * Only use if you need a fresh Query, otherwise the ItemsCache is probably a better (syncronous) option. If an
 * item was copied into the game world, the filter will favor the copy by name match.
 * @param itemType 
 * @returns 
 */
export const CombinedItems = async (itemType: string): Promise<Array<Item | TypedIndexEntry>> => {
    return CombinedItemsMultiType([itemType])
}

const documentPromiseCache = new Map<string, Promise<Item | null>>()

/**
 * A utility function for getting full Item data from a TypedIndexEntry, Item, or UUID.
 * Memoizes async lookups to avoid redundant network roundtrips.
 * @param item 
 * @returns 
 */
export async function getFullItem<T = any>(item: Item | TypedIndexEntry | string | null | undefined): Promise<(Item & { system: T }) | null> {
    if (!item) return null
    if (item instanceof Item) return item as Item & { system: T }

    const uuid = typeof item === "string" ? item : item.uuid
    if (!uuid) return null

    const worldItem = game.items?.get(uuid) || game.items?.find(it => it.uuid === uuid)
    if (worldItem instanceof Item) return worldItem as Item & { system: T }

    if (!documentPromiseCache.has(uuid)) {
        const promise = (async () => {
            try {
                const resolved = await fromUuid(uuid)
                if (resolved instanceof Item) {
                    return resolved
                }
                return null
            } catch (err) {
                console.error(`Failed to resolve document for UUID: ${uuid}`, err)
                return null
            }
        })()
        documentPromiseCache.set(uuid, promise)
    }

    const doc = await documentPromiseCache.get(uuid)
    return (doc as (Item & { system: T }) | null) ?? null
}

/**
 * A utility function for adding a TypedIndexEntry to an actor. It will
 * search for and copy the corresponding item by uuid.
 * @param actor 
 * @param item 
 * @returns 
 */
export async function addItemToActor(actor: Actor, item: Item | TypedIndexEntry | string): Promise<Item | undefined> {
    let sourceItemData: Record<string, unknown> | null

    if (item instanceof Item) {
        sourceItemData = item.toObject()
    } else {
        const fullItem = await getFullItem(item)
        if (!fullItem || !("toObject" in fullItem)) {
            const targetUuid = typeof item === "string" ? item : item?.uuid
            throw new Error(`Failed to resolve full document data for UUID: ${targetUuid}`)
        }
        sourceItemData = fullItem.toObject()
    }

    if (!sourceItemData) return undefined

    const createdItems = await actor.createEmbeddedDocuments("Item", [sourceItemData] as unknown as any[]);

    return createdItems[0] as Item | undefined
}

export async function addItemsToActor(actor: Actor, items: (Item | TypedIndexEntry)[]) {
    for (const item of items) {
        await addItemToActor(actor, item)
    }
}

export function isTypedIndexEntry(item: Item | TypedIndexEntry): item is TypedIndexEntry {
    return "uuid" in item && typeof (item as any).img === "string"
}

export const inventoryItemTypes = () => {
    return ['armor', 'weapon', 'sundry', 'alchemical', 'container']
}