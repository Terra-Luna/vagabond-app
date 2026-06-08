import ActorDataModel, { BaseActorSchema } from "../model/actor/ActorDataModel"

export const getId = (obj: any): string => {
    return obj?.parent?._id ?? ''
}

export const getName = (obj: any): string => {
    return obj?.parent?.name ?? ''
}

/**
 * Updates the given items' sort properties according to user preference.
 * @param actor 
 * @param dragItem 
 * @param targetItem 
 * @param siblings 
 */
export const itemSortHandler = (actor: ActorDataModel<BaseActorSchema>, dragItem: any, targetItem: any, siblings: any[]) => {
    const sorted = foundry.utils.performIntegerSort(dragItem.parent, {
        target: targetItem.parent,
        siblings: siblings.map((it: any) => it.parent)
    })
    const sortingUpdate = sorted.map((it: any) => {
        const update = it.update
        update._id = it.target._id
        return update
    })
    actor.parent.updateEmbeddedDocuments("Item", sortingUpdate)
}