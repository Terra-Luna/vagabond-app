import ActorDataModel, { BaseActorSchema } from "../model/actor/ActorDataModel"

export const getId = (obj: any): string => {
    return obj?.parent?._id ?? ''
}

export const getName = (obj: any): string => {
    return obj?.parent?.name ?? ''
}

export const getPortrait = (obj: any): string => {
    return obj.img
}

export const getTokenImg = (obj: any): string => {
    return obj.prototypeToken.texture.src
}

export const getTargets = (): string[] => {
    const targetIds = Array.from(game.user?.targets ?? []).map(t => t.id)
    return targetIds
}

/**
 * Updates the given items' sort properties according to user preference.
 * @param actor 
 * @param dragItem 
 * @param targetItem 
 * @param siblings 
 */
export const itemSortHandler = async (actor: ActorDataModel<BaseActorSchema>, dragItem: any, targetItem: any, siblings: any[]) => {
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