import { inventoryItemTypes } from "../model/actor/type/Inventory"

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
    return (obj?.document?.texture?.src ?? obj?.prototypeToken?.texture?.src) ?? null
}

export const getTargets = (): string[] => {
    const tokenIds = Array.from(game.user?.targets ?? []).map(t => t.id)
    return tokenIds
}

export const getCanvasToken = (id): Token | undefined => {
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

/**
 * A utility function which queries all world and compendium items of the given types and returns a combined list.
 * Best used in conjunction with inventoryItemTypes()
 * @param itemTypes 
 * @returns 
 */
export const CombinedItemsMultiType = async (itemTypes: string[]): Promise<Array<Item | TypedIndexEntry>> => {
    let allItems: Array<Item | TypedIndexEntry> = []
    for (const type of itemTypes) {
        const items = await CombinedItems(type)
        allItems = [...allItems, ...items]
    }
    return allItems
}

export const CombinedItemsAll = async (): Promise<Array<Item | TypedIndexEntry>> => {
    let allItems: Array<Item | TypedIndexEntry> = []
    const types = ['ancestry', 'class', 'perk', 'spell', ...inventoryItemTypes()]
    for (const type of types) {
        const items = await CombinedItems(type)
        allItems = [...allItems, ...items]
    }
    return allItems
}

/**
 * A utility function which queries all world and compendium items of the given type and returns a combined list.
 * @param itemType 
 * @returns 
 */
export const CombinedItems = async (itemType: string): Promise<Array<Item | TypedIndexEntry>> => {
    const worldItems = Array.from(game.items?.values() ?? []).filter(item => item?.type === itemType) as Item[]
    const packs = game.packs?.filter((pack) => pack.metadata.type === "Item") ?? []
    const compendiumItems: TypedIndexEntry[] = []

    for (const pack of packs) {
        await pack.getIndex({ fields: ["type"] } as unknown as Parameters<typeof pack.getIndex>[0])
        const entries = pack.index.contents as unknown as TypedIndexEntry[]
        const matches = entries.filter((entry) => entry?.type === itemType)
        compendiumItems.push(...matches)
    }

    return [...worldItems, ...compendiumItems]
}

/**
 * A utility function for getting full Item data from a TypedIndexEntry
 * @param item 
 * @returns 
 */
export async function getFullItem<T>(item: Item | TypedIndexEntry | null): Promise<Item & { system: T } | null> {
    if (!item || item instanceof Item) return item as Item & { system: T }
    const resolvedDocument = await fromUuid(item.uuid)
    if (resolvedDocument instanceof Item) {
        return resolvedDocument as Item & { system: T }
    }
    return null
}

/**
 * A utility function for adding a TypedIndexEntry to an actor. It will
 * search for and copy the corresponding item by uuid.
 * @param actor 
 * @param item 
 * @returns 
 */
export async function addItemToActor(actor: Actor, item: Item | TypedIndexEntry): Promise<Item | undefined> {
    let sourceItemData: Record<string, unknown> | null

    if (isTypedIndexEntry(item)) {
        // 1. Resolve compendium item via its UUID
        // fromUuid is asynchronous; it fetches the cold-storage document cleanly from disk
        const fullCompendiumItem = await fromUuid(item.uuid)

        if (!fullCompendiumItem || !("toObject" in fullCompendiumItem)) {
            throw new Error(`Failed to resolve full document data for UUID: ${item.uuid}`)
        }

        // Convert to a plain JavaScript object to cleanly decouple it from the compendium
        sourceItemData = (fullCompendiumItem as Item).toObject()
    } else {
        // 2. Clone active world item data to avoid mutating the original source
        sourceItemData = item.toObject()
    }

    if (!sourceItemData) return undefined

    // 3. Create the document embedded directly onto the actor
    // Foundry expects an array of data objects, and returns an array of instantiated documents
    const createdItems = await actor.createEmbeddedDocuments("Item", [sourceItemData] as unknown as any[]);

    return createdItems[0] as Item | undefined
}

export async function addItemsToActor(actor: Actor, items: (Item | TypedIndexEntry)[]) {
    for (const item of items) {
        await addItemToActor(actor, item)
    }
}

function isTypedIndexEntry(item: Item | TypedIndexEntry): item is TypedIndexEntry {
    return "uuid" in item && typeof (item as any).img === "string"
}