import ActorDataModel, { BaseActorSchema } from "../model/actor/ActorDataModel"

export const getId = (obj: any): string => {
    return obj?._id ?? obj?.parent?._id ?? ''
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

export const getCanvasToken = (id) => {
    return canvas?.tokens?.get(id)
}

/**
 * Updates the given items' sort properties according to user preference.
 * Places items into containers.
 * @param actor 
 * @param dragItem 
 * @param targetItem 
 * @param siblings 
 */
export const inventoryItemDragDropHandler = async (actor: ActorDataModel<BaseActorSchema> | undefined, dragItem: any, targetItem: any, siblings: any[]) => {
    if (actor === undefined) return
    if (targetItem.parent.type === 'container' && dragItem.parent.type !== 'container') {
        targetItem.parent.update({ 'system.itemIds': [...targetItem.itemIds, dragItem.parent.id] })
    }
    else {
        const sortBefore = siblings.indexOf(targetItem) < siblings.indexOf(dragItem)
        const sorted = foundry.utils.performIntegerSort(dragItem.parent, {
            target: targetItem.parent,
            sortBefore: sortBefore,
            siblings: siblings.map((it: any) => it.parent)
        })
        const sortingUpdate = sorted.map((it: any) => {
            const update = it.update
            update._id = it.target._id
            return update
        })
        await actor.parent.updateEmbeddedDocuments("Item", sortingUpdate)
    }
}